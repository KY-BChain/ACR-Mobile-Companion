#!/bin/zsh
# Stage everything the four backend services need onto an external volume, so
# that taking over is a copy already done rather than a copy to be made.
#
#   scripts/stage-services-to-ssd.sh                     to /Volumes/KY120GBackup
#   scripts/stage-services-to-ssd.sh --dest <path>       somewhere else
#   scripts/stage-services-to-ssd.sh --with-secrets      include the key material
#   scripts/stage-services-to-ssd.sh --dry-run           list, copy nothing
#
# THIS DOES NOT SWITCH ANYTHING OVER. It only places files. Nothing reads from
# the staged copy until ACR_AUTH_DIR and the Maven repository are pointed at it,
# which is a separate, deliberate act.
#
# WHY THE SECRETS ARE HELD BACK BY DEFAULT. gate10 holds auth.db and pepper.bin,
# and ~/.cloudflared holds the credentials that let this machine run the tunnel.
# Copied to an UNENCRYPTED volume they become another plaintext copy of the
# material that validates all reviewer access, on the most losable device in the
# chain. --with-secrets therefore refuses unless the destination volume is
# encrypted. Together they are under 2 MB: at switch-over they copy in a second,
# so there is nothing to gain by staging them early and something to lose.

set -uo pipefail

DEST_ROOT="/Volumes/KY120GBackup"
WITH_SECRETS=0
DRY=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest)         DEST_ROOT="${2:?--dest needs a path}"; shift 2 ;;
    --with-secrets) WITH_SECRETS=1; shift ;;
    --dry-run)      DRY=1; shift ;;
    *) print -u2 "unknown option: $1"; exit 2 ;;
  esac
done

REPO_DIR="${0:A:h:h}"
ONTOLOGY="${ACR45_ONTOLOGY_PATH:-/Users/Kraken/DAPP/ACR-platform/ontology/breast-cancer/ACR_Ontology_Full_v2_2.owl}"
AUTH_DIR="${ACR_AUTH_DIR:-$HOME/.acr-gateway/gate10}"
DEST="$DEST_ROOT/acr-services"

note() { print -- "  $*"; }
fail() { print -u2 "FAILED: $*"; exit 1; }

[[ -d "$DEST_ROOT" ]] || fail "$DEST_ROOT is not mounted"

# Is the destination volume encrypted? Needed for --with-secrets.
encrypted=$(diskutil info "$DEST_ROOT" 2>/dev/null | awk -F': *' '/^ *(Encrypted|FileVault)/ {print $2; exit}')
if (( WITH_SECRETS )) && [[ "$encrypted" != "Yes" ]]; then
  fail "$DEST_ROOT is not encrypted — refusing --with-secrets.
       Erase it as APFS (Encrypted) first, and do not save the passphrase to
       the login keychain. Without that, staging the pepper here makes things
       worse, not better."
fi

print -- "Staging the backend service stack"
note "from : this MacBook"
note "to   : $DEST"
note "secrets: $( (( WITH_SECRETS )) && print 'INCLUDED' || print 'held back (volume not encrypted / not asked)')"
(( DRY )) && note "DRY RUN — nothing will be written"
print -- ""

copy() {                               # copy <label> <source> <dest-subpath>
  local label="$1" src="$2" sub="$3"
  if [[ ! -e "$src" ]]; then note "skip  $label — not found: $src"; return; fi
  local size; size=$(du -sh "$src" 2>/dev/null | cut -f1)
  if (( DRY )); then note "would copy  $label  ($size)  -> $sub"; return; fi
  mkdir -p "$DEST/${sub:h}" 2>/dev/null
  if [[ -d "$src" ]]; then
    rsync -rtl --no-perms --no-owner --no-group "$src/" "$DEST/$sub/" \
      || note "WARNING  $label copied with errors"
  else
    rsync -tl --no-perms --no-owner --no-group "$src" "$DEST/$sub" \
      || note "WARNING  $label copied with errors"
  fi
  note "copied  $label  ($size)  -> $sub"
}

copy "T3 gateway"        "$REPO_DIR/gateway"                             "gateway"
copy "service scripts"   "$REPO_DIR/scripts"                             "scripts"
copy "T1 project"        "/Users/Kraken/DAPP/ACR-platform/ACR-Ontology-Interface" "ACR-Ontology-Interface"
copy "ontology"          "$ONTOLOGY"                                     "ontology/ACR_Ontology_Full_v2_2.owl"
copy "maven repository"  "$HOME/.m2"                                     "m2"

if (( WITH_SECRETS )); then
  copy "auth store + pepper" "$AUTH_DIR"        "gate10"
  copy "tunnel credentials"  "$HOME/.cloudflared" "cloudflared"
  (( DRY )) || chmod -R go-rwx "$DEST/gate10" "$DEST/cloudflared" 2>/dev/null
fi

(( DRY )) && { print -- "\nDry run complete."; exit 0; }

{
  print -- "ACR backend service stack — staged copy"
  print -- "taken    : $(date -u +%Y%m%dT%H%M%SZ)"
  print -- "secrets  : $( (( WITH_SECRETS )) && print included || print 'NOT included')"
  print -- ""
  print -- "This is a staged copy, not a running service. Nothing uses it until"
  print -- "the service is deliberately pointed at it:"
  print -- ""
  print -- "  export ACR_AUTH_DIR=$DEST/gate10"
  print -- "  mvn -Dmaven.repo.local=$DEST/m2 ...      (or settings.xml)"
  print -- ""
  print -- "Without gate10 and cloudflared present, the service will refuse to"
  print -- "start — check_files() in build50-review-service.sh stops at step 1."
} > "$DEST/README.txt"

print -- ""
print -- "Staged. Total on the volume:"
du -sh "$DEST" 2>/dev/null | sed 's/^/  /'
