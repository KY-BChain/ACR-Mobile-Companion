#!/bin/zsh
# Archive closed gateway and tunnel logs off this MacBook, for audit.
#
#   scripts/archive-gateway-logs.sh --dry-run    say what would happen, change nothing
#   scripts/archive-gateway-logs.sh              archive to /Volumes/AndroidDev
#   scripts/archive-gateway-logs.sh --dest <p>   somewhere else
#   scripts/archive-gateway-logs.sh --keep 24    hold more than twelve months
#
# WHY THIS EXISTS. T3 writes one line of JSON per request to
# ~/.acr-gateway/logs/gateway-<stamp>.log, and a restart of T3 opens a new file.
# Nothing has ever pruned or copied them: on 14 October 2026 there were 21
# gateway logs and 21 tunnel logs, 2.1 MB, going back to 12 September. They grow
# without limit, and the only copy off this machine is inside Time Machine.
#
# The copy the website shows is NOT an archive. api/log-ingest.php holds a
# rolling 4,000 lines and silently discards the rest, so for anything older than
# about a fortnight this MacBook is the sole record. That is what this fixes.
#
# WHAT IT DOES NOT TOUCH. The live log — the newest gateway-*.log and the newest
# tunnel-*.log — is left exactly where it is, because T3 and T4 still have it
# open. Only closed files are archived, and only after their contents are safely
# inside a verified bundle. No service is started, stopped or signalled.
#
# WHAT A BUNDLE CONTAINS. One gzipped tar per calendar month, named for that
# month, holding every closed log whose own timestamp falls in it. A log's month
# comes from its filename (gateway-20261014T065916Z.log -> 2026-10), not from
# the file's modification time, which a copy or a restore would change.

set -uo pipefail

LOG_DIR="$HOME/.acr-gateway/logs"
DEST_ROOT="/Volumes/AndroidDev"
KEEP=12
DRY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest)    DEST_ROOT="${2:?--dest needs a path}"; shift 2 ;;
    --keep)    KEEP="${2:?--keep needs a number}"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    *) print -u2 "unknown option: $1"; exit 2 ;;
  esac
done

note() { print -- "  $*"; }
fail() { print -u2 "FAILED: $*"; exit 1; }

[[ -d "$LOG_DIR" ]]   || fail "no log directory at $LOG_DIR"
[[ -d "$DEST_ROOT" ]] || fail "$DEST_ROOT is not mounted. Attach the drive and run this again."
command -v tar >/dev/null || fail "tar is not on the path"

DEST="$DEST_ROOT/acr-gateway-backups/logs"
(( DRY )) || mkdir -p "$DEST" || fail "could not create $DEST"

# The live files: newest of each kind. These stay.
live_gw=$(ls -t "$LOG_DIR"/gateway-*.log 2>/dev/null | head -1)
live_tn=$(ls -t "$LOG_DIR"/tunnel-*.log  2>/dev/null | head -1)

print -- "Archiving closed gateway logs"
note "from  : $LOG_DIR"
note "to    : $DEST"
note "live  : ${${live_gw:t}:-none} (kept in place)"
note "live  : ${${live_tn:t}:-none} (kept in place)"
(( DRY )) && note "DRY RUN — nothing will be written or removed"
print -- ""

# Group the closed logs by the month in their own filename.
typeset -A months
for f in "$LOG_DIR"/gateway-*.log(N) "$LOG_DIR"/tunnel-*.log(N); do
  [[ "$f" == "$live_gw" || "$f" == "$live_tn" ]] && continue
  stamp="${f:t}"
  stamp="${stamp##*-}"                 # 20261014T065916Z.log
  yr="${stamp[1,4]}"; mo="${stamp[5,6]}"
  if [[ "$yr" != [0-9][0-9][0-9][0-9] || "$mo" != [0-9][0-9] ]]; then
    note "skip  ${f:t} — no date in the name"
    continue
  fi
  key="$yr-$mo"
  months[$key]="${months[$key]:-} ${f:t}"
done

(( ${#months} )) || { print -- "Nothing to archive: every log is still live."; exit 0; }

archived=0
for key in ${(ok)months}; do
  files=(${=months[$key]})
  bundle="$DEST/$key.tar.gz"
  note "$key — ${#files} file(s)"

  if (( DRY )); then
    for f in $files; do print -- "      would archive $f"; done
    continue
  fi

  # A month already archived gets its new files added, by rebuilding from the
  # old bundle plus the new ones. Appending to a .tar.gz is not possible.
  work=$(mktemp -d) || fail "could not make a work directory"
  if [[ -f "$bundle" ]]; then
    tar -xzf "$bundle" -C "$work" || { rm -rf "$work"; fail "could not read the existing $key.tar.gz"; }
  fi
  for f in $files; do cp -p "$LOG_DIR/$f" "$work/" || { rm -rf "$work"; fail "could not copy $f"; } done

  tmp="$bundle.new"
  ( cd "$work" && tar -czf "$tmp" . ) || { rm -rf "$work"; fail "could not write $tmp"; }

  # Prove the bundle is readable and holds what it should BEFORE removing
  # anything from the log directory.
  held=$(tar -tzf "$tmp" 2>/dev/null | grep -c '\.log$') || held=0
  want=$(ls -1 "$work"/*.log 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$held" != "$want" ]]; then
    rm -rf "$work" "$tmp"
    fail "$key.tar.gz would hold $held logs but should hold $want — nothing removed"
  fi

  mv "$tmp" "$bundle" || { rm -rf "$work"; fail "could not put $bundle in place"; }
  rm -rf "$work"

  for f in $files; do rm -f -- "$LOG_DIR/$f"; done
  note "      archived and removed ${#files} file(s) — $(du -h "$bundle" | cut -f1)"
  archived=$(( archived + ${#files} ))
done

(( DRY )) && { print -- "\nDry run complete."; exit 0; }

# Keep the most recent months only.
cd "$DEST" || fail "cannot enter $DEST"
typeset -a old
old=(*.tar.gz(N.On))
if (( ${#old} > KEEP )); then
  for b in "${old[@]:$KEEP}"; do
    rm -f -- "$b" && note "pruned $b (older than $KEEP months)"
  done
fi

chmod -R go-rwx "$DEST" 2>/dev/null || true

{
  print -- "ACR gateway log archive"
  print -- "last run : $(date -u +%Y%m%dT%H%M%SZ)"
  print -- "source   : $LOG_DIR on the MacBook"
  print -- "retention: $KEEP monthly bundles"
  print -- ""
  print -- "One gzipped tar per calendar month of CLOSED logs. The live log is"
  print -- "never archived. To read a month back:"
  print -- "  tar -xzf 2026-10.tar.gz -C /tmp/look"
  print -- ""
  print -- "These are the audit record. The copy on the websites holds only a"
  print -- "rolling 4,000 lines and discards the rest."
} > "$DEST/README.txt"

print -- ""
print -- "Done. $archived log file(s) archived; ${#old[@]} monthly bundle(s) held, keeping $KEEP."
