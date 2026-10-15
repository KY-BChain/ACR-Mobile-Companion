#!/bin/zsh
# Hold the Mac awake until Time Machine has finished — including while it pauses.
#
#   scripts/keep-awake-for-backup.sh          hold until the backup finishes
#   scripts/keep-awake-for-backup.sh --max 8  give up after 8 hours
#
# WHY THIS EXISTS. On 13 October 2026 a full backup died at 86% because the Mac
# slept. Time Machine's own backupd holds a "Backup Job" sleep assertion, but
# only while it is actively copying — when the job paused, that assertion was
# released. The other two assertions on this machine are tied to the PIDs of T1
# and the review gateway, so stopping the services removed those too. Nothing
# was left, and the Mac slept with 28 minutes of backup to go.
#
# This one is tied to the BACKUP, not to a process: it holds for as long as
# tmutil reports a backup in progress, pauses included, and releases itself the
# moment it finishes.
#
#   -i  no idle system sleep        -m  no disk idle sleep
#   -s  no system sleep on AC power
# Deliberately NO -d: the screen is still free to sleep.
#
# Keep the Mac on mains power, and do not close the lid — a closed lid sleeps
# the machine whatever any assertion says.

set -uo pipefail

MAX_HOURS=12
[[ "${1:-}" == "--max" ]] && MAX_HOURS="${2:?--max needs a number of hours}"

# 1 while a backup is running or paused, 0 otherwise. A missing key means idle.
backup_running() {
  local v
  v=$(tmutil status 2>/dev/null | awk -F'=' '/Running/ { gsub(/[ ;]/, "", $2); print $2; exit }')
  [[ "$v" == "1" ]]
}

if ! backup_running; then
  print -- "No Time Machine backup is running. Nothing to hold awake."
  exit 0
fi

print -- "Holding the Mac awake until the backup finishes (up to ${MAX_HOURS}h)."
print -- "The screen may still sleep. Ctrl+C to release early."

deadline=$(( $(date +%s) + MAX_HOURS * 3600 ))

# caffeinate holds the assertion for exactly as long as this loop runs.
caffeinate -ims zsh -c '
  while true; do
    v=$(tmutil status 2>/dev/null | awk -F"=" "/Running/ { gsub(/[ ;]/, \"\", \$2); print \$2; exit }")
    [[ "$v" == "1" ]] || exit 0
    [[ $(date +%s) -ge '"$deadline"' ]] && exit 0
    sleep 60
  done
'

if backup_running; then
  print -- "Gave up after ${MAX_HOURS}h — the backup is still running. Assertion released."
else
  print -- "Backup finished. Assertion released; the Mac may sleep normally again."
fi
