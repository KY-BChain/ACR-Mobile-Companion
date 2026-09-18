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
