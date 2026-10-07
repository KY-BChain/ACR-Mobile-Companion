Run the script of /Users/Kraken/DAPP/acr-mobile-companion/scripts/acr-services.sh in a Terminal and it opens each service in its own Terminal window, in order. It moves on only when the previous service is healthy. The script contains only commands and status messages.

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/acr-services.sh
```

What happens:-

Checks: Maven, cloudflared, the platform folder and the Build 47 review script are present.
T1: opens a window titled "T1 · ACR Platform" running mvn spring-boot:run -Dspring-boot.run.profiles=hybrid. It waits, with a progress message every 20 s (up to 5 min), until health, status and manifest all answer.

T2: opens "T2 · acr-api tunnel" running cloudflared tunnel run --url http://localhost:8080 acr-api. It waits (up to 2 min) until api.acragent.com is healthy, then confirms the website protection rule is active.

T3 + T4: opens "T3 + T4 · Build 47 review service" running scripts/build47-review-service.sh start. It waits until the mobile gateway is healthy, then confirms unencrypted HTTP is refused. The Mac stays awake while T3 runs.

Finish: "All services are up", followed by the stop order:
scripts/build47-review-service.sh stop;
Ctrl+C in the T2 window;
Ctrl+C in the T1 window.
Behaviour

A service that is already healthy is not started again, so no duplicate windows open.
If any step fails or times out, the script shows ✘ with the reason and stops. Nothing after that step is started, and the service's own window shows the details.
Tested: the syntax check passed, and it ran once while all four services were already healthy. Every step reported "already running", no windows opened, nothing started.

Not tested: actually opening the windows, since that would start T1/T2. The first time it opens a window, macOS may ask to allow Terminal to be controlled. Click OK.

## Stopping

The same script stops everything, in reverse order:

```sh
cd /Users/Kraken/DAPP/acr-mobile-companion
scripts/acr-services.sh stop
```

It stops T4 and T3 first, then shows which of T1 and T2 are running and asks you
to confirm before signalling them — the ACR Platform website loses its back end
at that moment. Answer anything but `y` and T1 and T2 are left running, to be
closed with Ctrl+C in their own windows.

Claude never starts or stops T1 or T2; only you do, whether by this command or
by Ctrl+C.

## Services monitor & none-sleep mode

A loop checking both health endpoints every twenty minutes or so, and telling you the moment either returns 530, is exactly the job:


/loop 20m check https://api.acragent.com/api/infer/health and
https://mobile-gateway-review.acragent.com/health — report immediately if
either is not 200

The above is issue in Claude Code with the /loop, or in a Terminal with the following Zsh CLI command script:

```sh
while true; do
  printf '%s  api=%s  gateway=%s\n' "$(date '+%d %b %H:%M')" \
    "$(curl -s -o /dev/null -m 15 -w '%{http_code}' https://api.acragent.com/api/infer/health)" \
    "$(curl -s -o /dev/null -m 15 -w '%{http_code}' https://mobile-gateway-review.acragent.com/m/v1/live)"
  sleep 1800
done
```

1200 = 20 minutes, 1800 = 30 minutes — seconds, as with caffeinate -t. I'd put 1800 in above.

You don't need a separate sleep command. T3/T4 already do it. But optional if desired.

build49-review-service.sh:186 runs:

```sh
caffeinate -ims -w "$gp" &
```
-i no idle sleep, -m no disk sleep, -s no system sleep on mains — tied to the gateway's process, so it holds for exactly as long as T3 is alive and releases itself when you stop the service. It even prints "Mac kept awake while the gateway runs".

MacBook on AC power at 100%, so -s applies.

## Alert of access to the four services of T1 to T4
The app has been connecting — read it here

~/.acr-gateway/logs/gateway-20261001T180048Z.log
The gateway logs one JSON line per request. Not the Terminal windows — they only show the startup checks. This file is the record.

What to look for — the route tells you who it is:

Route	Meaning
/m/v1/live alone	just a health probe — your monitor or my checks. Not a device.
/m/v1/auth/redeem	a new device redeeming an invite code — first ever connection
/m/v1/auth/refresh	a device resuming an existing session — the app has opened
/m/v1/attestation	the app verifying the backend
/m/v1/infer + inference.complete	an actual assessment run through the reasoner

for example:
Five app sessions since the service started:

01 Oct 18:12 UTC   refresh, attestation ×3, infer         ← assessment run
01 Oct 22:51 UTC   refresh, attestation ×2
02 Oct 02:14 UTC   refresh, attestation
02 Oct 11:25 UTC   refresh, attestation ×4, infer         ← assessment run
02 Oct 12:09 UTC   refresh, attestation
Two inferences completed with resultMode: LIVE_REASONER, reasoningMode: OPENLLET_SWRL — the full SWRL/Openllet path, 672 ms and 209 ms. The backend is doing real work, not just answering health checks.

But — every one of those is auth/refresh, not auth/redeem. Refresh means a device that already held a session: one of your three phones. There is no /m/v1/auth/redeem in the log at all.

So Apple's reviewer has not opened the app yet. The moment they do, you'll see /m/v1/auth/redeem — that's the invite code being used for the first time, and it's your proof the review has actually begun.

To watch for exactly that:

tail -f ~/.acr-gateway/logs/gateway-20261001T180048Z.log | grep --line-buffered redeem
Silent until it happens, then one line.

To see the sessions without the health-check noise:

grep -E "redeem|refresh|infer" ~/.acr-gateway/logs/gateway-20261001T180048Z.log

Three commands, none needing a filename
Watch for Apple's reviewer arriving — open a third Terminal, paste this, leave it:
```sh
tail -f "$(ls -t ~/.acr-gateway/logs/gateway-*.log | head -1)" | grep --line-buffered redeem
```
Silent until it happens. One line appears the moment the invite code is used for the first time. Ctrl+C to stop.

See all app activity, no health-check noise:

```sh
grep -E "redeem|refresh|infer" "$(ls -t ~/.acr-gateway/logs/gateway-*.log | head -1)"
```
Watch everything the app does, live — more useful than just redeem, because you'll see the whole session unfold:

```sh
tail -f "$(ls -t ~/.acr-gateway/logs/gateway-*.log | head -1)" | grep --line-buffered -E "redeem|refresh|infer"
```
A fresh log is created each time T3 starts, stamped with that moment — gateway-20261001T180048Z.log is yesterday 18:00 UTC, when you started the services. Nothing else writes to the folder while the service runs, so newest and live are the same file.

If you ever want certainty rather than inference, this asks the running process directly:

```sh
lsof -p $(lsof -nP -iTCP:3001 -sTCP:LISTEN -t) | grep '\.log'
```
One thing to remember: if you restart the services, a new log is created and your tail -f will keep watching the old, now-dead file silently. Restart the tail whenever you restart T3.