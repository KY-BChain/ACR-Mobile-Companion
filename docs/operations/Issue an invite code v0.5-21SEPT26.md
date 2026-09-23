WeChat MiniProgram is the same procedure as for a ZZU reviewer on the iOS app. Only two things change: `--org` and `--label`. The code has nothing to do with Apple or WeChat. Our own review gateway issues it and checks it.

## Issuing an invite code

**Step 1: Start the services.** In Terminal:

```zsh
/Users/Kraken/DAPP/acr-mobile-companion/scripts/acr-services.sh start
```

Wait until T1 to T4 all show as running. You can issue a code without them, but nobody can redeem it until they're up.

**Step 2: Open a new Terminal window and go to the gateway folder:**

```zsh
cd /Users/Kraken/DAPP/acr-mobile-companion/gateway
```

**Step 3: Issue the code.** Copy the whole command, all three lines:

```zsh
ACR_AUTH_STORE_PATH=$HOME/.acr-gateway/gate10/auth.db \
ACR_AUTH_PEPPER_PATH=$HOME/.acr-gateway/gate10/pepper.bin \
  node src/auth/invite-admin.js issue --org CRIL --label kraken-wechat-01 --issued-by Kraken
```

**Step 4: Copy the code it prints.** It appears once and is stored nowhere, so if you lose it, just issue a new one.

**Step 5: Redeem it.** In the mini-program, enter the code on the invite screen.

## For a ZZU reviewer

Change only the two values in Step 3:

```
--org ZZU --label zzu-reviewer-01
```

## Rules the tool enforces

- **`--org`** must be one of **ZZU, UCD, HKU, CRIL, TEST**.
- **`--label`** can only contain letters, numbers, `-` and `_`, up to 64 characters. Never use a person's real name. Use a number (`zzu-reviewer-01`, `-02`, and so on) and keep your own private list of who has which number.
- **Each code works once, on one install.** Your iPhone app already has its own code, so the mini-program needs a new one. A ZZU reviewer who uses both the iOS app and the mini-program needs two codes.
- **Leave out either `ACR_AUTH_…` line and the tool still prints a code, but the code won't work.** Without those lines the tool writes to an old, empty database. Always copy all three lines.

## Two notes for the mini-program

- The mini-program currently identifies itself to the gateway as the iOS/Android app (`mob-v0.6.7+49`, channel MOBILE; set in `config/appIdentity.js`). That's why a standard code works. Whether it should get its own identity is still your decision to make.
- **Testing in WeChat DevTools:** switch off domain checking in the project settings. **Testing on a phone:** `mobile-gateway-review.acragent.com` must first be registered in the mini-program's admin console.
