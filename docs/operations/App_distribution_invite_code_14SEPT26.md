Part A is done and committed as 457c74fd, one commit ahead of GitHub for you to push.

1. Part A: organisation-tagged invite codes
New format: codes look like ACR-ZZU-XXXXXXXX-YYYYYYYYYYYY. The allowed tags are ZZU, UCD, HKU, and TEST for your own phones, listed in gateway/src/auth/organisations.js. To add a partner, add its tag there and restart the gateway.
Issuing: issue --org ZZU --label zzu-001 --issued-by Kraken. --org is required, and an unknown tag is refused. list and sessions now show each code's organisation.
A tag can't be swapped. A code with the wrong tag, say a ZZU code changed to HKU, is refused like a wrong code and counts towards the lockout limit.
Typing is more forgiving. Capitals don't matter, spaces around the code are ignored, and O, I and L are read as 0, 1 and 1. Before this change, a code typed in lower case was refused.
Existing codes still work, and the gateway still holds no names or email addresses, only the tag and label.
Tests: 19 new; gateway 231/231, end-to-end 4/4. Both runbooks show the new command and format.
Store: one store (gate10), as you chose. I backed it up to ~/.acr-gateway/backups/ before the change; the gateway adds the new column the next time it opens the store.
Please check the tag list: you wrote "ZZH" once and "ZZU" elsewhere. I used ZZU; tell me if ZZH is a separate partner and I'll add it.
2. Your three phones need nothing
A code is only used once, at pairing. The phones are already paired, so the change doesn't touch them: open the app with T1–T4 running and each signs in by itself.

Their old ACR45- codes stay valid for re-entry after Disconnect. Re-tagging them as TEST would mean Disconnect and re-pair, with no real benefit.

3. The Android APK
Where it is:


/Users/Kraken/DAPP/acr-mobile-companion/android/app/build/outputs/apk/release/app-release.apk
73.1 MB · ACR Companion 0.6.5 (46)
SHA-256 b0912c90892e37292f1db9cc01d71f5f7c6f2b40bd6538c051d8d7eabac2a442
It's a build output and isn't stored in git, and every rebuild overwrites it. Copy each release you send out to a separate folder, together with its SHA-256.

Installing it on a reviewer's phone:

Send a direct HTTPS download link, plus the SHA-256 so they can check the file. WeChat often blocks APK downloads, so a link from your own site works better.
On the phone, open the file. Android asks to allow Install unknown apps for the browser or file manager being used; allow it once.
Tap Install. Google Play Protect, or HyperOS on Xiaomi, will warn that the developer is unknown; choose Install anyway. Chinese phones without Google services are fine, as the app doesn't need them.
Open ACR Companion and enter the code. The pairing pop-up confirms it's bound to that phone.
Updates install over the top and keep the session, but only if they're signed with the same key (point A below).
Decide these before the first APK goes to ZZU, because each is hard to change afterwards:

A. The signing key. This is the important one. The release is signed with the development ("debug") key, which is fine on your own phones. For outside users you need your own release key, and Google Play requires one. Changing the key later means every reviewer must uninstall, losing their session, and reinstall. So create the release key before distributing, and keep it backed up; losing it means you can never update the app.
B. The app ID. It's com.anonymous.acr_mobile_companion, a placeholder from the template. Google Play and the Chinese stores treat a new ID as a different app, so fix it before the first external release. Something like com.acragent.companion.
C. Size. The 73 MB APK contains code for all four processor types. A modern phone needs only one, so a per-phone APK would be roughly a third of the size. Google Play needs an app bundle (.aab) anyway and then trims it automatically.
D. Google Play's minimum Android version. The app targets Android API 34. Play raises its minimum for new apps every year, so check the current requirement when you register; a raise may be needed first.
E. Chinese stores. Huawei, Xiaomi, OPPO, vivo and Tencent generally require China's app filing with the MIIT (APP备案) and often a software copyright certificate (软著). These take weeks, so start early if you go that way.
When you're ready, I can do A to C together in one change: create the release key, set the new app ID, and build per-phone APKs plus an app bundle. That needs a fresh install on your three phones, because a new ID counts as a new app, so they'd re-pair once. It's best done before any ZZU reviewer installs.