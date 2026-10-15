#!/bin/zsh
# Back up the review gateway's invite store and its pepper.
#
#   scripts/backup-gateway-auth.sh                 to /Volumes/AndroidDev
#   scripts/backup-gateway-auth.sh --dest <path>   somewhere else (testing)
#   scripts/backup-gateway-auth.sh --keep 5        keep more than three
#
# WHY THIS EXISTS. Invite codes are issued by the gateway on this MacBook and
# verified against ~/.acr-gateway/gate10/auth.db. Mixed into every invite and
# session hash is pepper.bin — 32 bytes that, until 12 October 2026, existed in
# exactly one place and were in no backup. Without the pepper the database is
# unreadable even if you still have it, so losing that one file ends every
# reviewer's access at once. The two are therefore always copied together: a
# backup of one without the other is worthless.
#
# The database is copied with sqlite3 .backup rather than cp. The gateway runs
# in WAL mode, so a plain cp of a live database can capture a torn page and a
# stale WAL; .backup takes a consistent snapshot of a database in use.
#
# WHAT THIS MEANS FOR THE DRIVE. Once this has run, the destination holds the
# key material that validates all reviewer access. It deserves the same care as
# this laptop. Nothing here is encrypted — if that is wanted, point --dest at a
# mounted encrypted disk image instead.
#
# Nothing of the mobile-app implementation work is touched: everything is
# written under acr-gateway-backups/, a folder of its own.

set -euo pipefail

# Honour the same override the service script uses, so a store that has been
# moved to another volume is still the one that gets backed up. Without this the
# backup would quietly keep copying the old location and report success.
AUTH_DIR="${ACR_AUTH_DIR:-${ACR45_AUTH_DIR:-$HOME/.acr-gateway/gate10}}"
STORE="$AUTH_DIR/auth.db"
PEPPER="$AUTH_DIR/pepper.bin"
DEST_ROOT="/Volumes/AndroidDev"
KEEP=3

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest) DEST_ROOT="${2:?--dest needs a path}"; shift 2 ;;
    --keep) KEEP="${2:?--keep needs a number}"; shift 2 ;;
    *) print -u2 "unknown option: $1"; exit 2 ;;
  esac
done

note() { print -- "  $*"; }
fail() { print -u2 "FAILED: $*"; exit 1; }

[[ -f "$STORE"  ]] || fail "no invite store at $STORE"
[[ -f "$PEPPER" ]] || fail "no pepper at $PEPPER — do not proceed, a backup without it is useless"
[[ -d "$DEST_ROOT" ]] || fail "$DEST_ROOT is not mounted. Attach the drive and run this again."
command -v sqlite3 >/dev/null || fail "sqlite3 is not on the path"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$DEST_ROOT/acr-gateway-backups/$STAMP"
mkdir -p "$DEST" || fail "could not create $DEST"

print -- "Backing up the gateway invite store"
note "from : $STORE"
note "to   : $DEST"

# A consistent snapshot of a database that may be in use.
sqlite3 "$STORE" ".backup '$DEST/auth.db'" || fail "sqlite3 .backup failed"
cp -p "$PEPPER" "$DEST/pepper.bin" || fail "could not copy the pepper"

# Prove the copy is readable and carries the invitations, rather than assuming.
invites=$(sqlite3 "$DEST/auth.db" "SELECT COUNT(*) FROM invitations;" 2>/dev/null) \
  || fail "the copied database could not be read back"
sessions=$(sqlite3 "$DEST/auth.db" "SELECT COUNT(*) FROM sessions;" 2>/dev/null || print 0)

{
  print -- "ACR review gateway backup"
  print -- "taken      : $STAMP"
  print -- "source     : $STORE"
  print -- "invitations: $invites"
  print -- "sessions   : $sessions"
  print -- ""
  print -- "Restore with both files together, into ~/.acr-gateway/gate10/:"
  print -- "  cp auth.db pepper.bin ~/.acr-gateway/gate10/"
  print -- "auth.db without pepper.bin cannot be used."
} > "$DEST/README.txt"

# Reading the copy back leaves an empty -wal and a -shm beside it. Clear them,
# so the folder holds exactly the two files a restore needs and nothing that
# could be mistaken for pending data.
rm -f -- "$DEST/auth.db-wal" "$DEST/auth.db-shm"

chmod -R go-rwx "$DEST" 2>/dev/null || true

note "invitations copied: $invites"
note "sessions copied   : $sessions"

# Keep the most recent few, matching the release-archive convention.
cd "$DEST_ROOT/acr-gateway-backups"
typeset -a old
old=(*(/On))                       # directories, newest first
if (( ${#old} > KEEP )); then
  for d in "${old[@]:$KEEP}"; do
    rm -rf -- "$d" && note "pruned $d"
  done
fi

print -- "Done. ${#old[@]} backup(s) held, keeping $KEEP."
