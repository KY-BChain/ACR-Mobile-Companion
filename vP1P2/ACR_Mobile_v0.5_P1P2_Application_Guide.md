# ACR Mobile Companion — v0.5 P1/P2 Update
## Application Guide & Git Commit Instructions

---

## 1. HOW TO APPLY THE CHANGES

### Step A: Verify your backup
Confirm your ZIP backup of `~/DAPP/acr-mobile-companion/` exists on the external USB.

### Step B: Create new files
Create these **two new files** in your project:

| New File | Path |
|----------|------|
| P1Screen.tsx | `~/DAPP/acr-mobile-companion/src/screens/P1Screen.tsx` |
| P2Screen.tsx | `~/DAPP/acr-mobile-companion/src/screens/P2Screen.tsx` |

Copy the source code from the previous message into each file.

### Step C: Replace existing files
Replace these **existing files** with the updated versions from the previous message:

| File | Path | What Changed |
|------|------|-------------|
| assessmentStore.ts | `src/store/assessmentStore.ts` | Added `P1State`, `P2State`, `setP1`, `setP2`, initial state, reset |
| AppNavigator.tsx | `src/navigation/AppNavigator.tsx` | Added `P1` and `P2` to `RootStackParamList` + screen registrations |
| Step1ReceptorsScreen.tsx | `src/screens/Step1ReceptorsScreen.tsx` | `Step 1 of 3` → `Step 1 of 5` |
| Step2TumourScreen.tsx | `src/screens/Step2TumourScreen.tsx` | `Step 2 of 3` → `Step 2 of 5` |
| Step3MarkersScreen.tsx | `src/screens/Step3MarkersScreen.tsx` | `Step 3 of 3` → `Step 3 of 5`; Next → navigates to P1 |
| ReviewScreen.tsx | `src/screens/ReviewScreen.tsx` | Added Provisional P1/P2 review cards |
| en-GB.json | `src/locales/en-GB.json` | Added p1, p2, review keys; updated step counts |
| fr-FR.json | `src/locales/fr-FR.json` | Same (translated) |
| de-DE.json | `src/locales/de-DE.json` | Same (translated) |
| ru-RU.json | `src/locales/ru-RU.json` | Same (translated) |
| ar-SA.json | `src/locales/ar-SA.json` | Same (translated) |
| zh-CN.json | `src/locales/zh-CN.json` | Same (translated) |
| ko-KR.json | `src/locales/ko-KR.json` | Same (translated) |
| ja-JP.json | `src/locales/ja-JP.json` | Same (translated) |

### Step D: Files that do NOT change
These files remain exactly as they are:
- `WelcomeScreen.tsx`
- `ResultScreen.tsx`
- `FailClosedScreen.tsx`
- `AboutScreen.tsx`
- `config.ts`
- `app.json`
- All component files (`ScreenLayout`, `ACRCard`, `ACRInput`, `ACRButton`, `ACRSegmentedControl`, etc.)
- All theme files
- All utility files (`uuid.ts`, etc.)
- All API files (`infer.ts`, `attestation.ts`)

---

## 2. GIT COMMANDS (run in order)

Open Terminal and navigate to your project:

```bash
cd ~/DAPP/acr-mobile-companion
```

### 2.1 Check current status
```bash
git status
```
You should see a clean working tree (or any pre-existing changes you already know about).

### 2.2 Stage all changes
```bash
git add src/store/assessmentStore.ts
git add src/navigation/AppNavigator.tsx
git add src/screens/Step1ReceptorsScreen.tsx
git add src/screens/Step2TumourScreen.tsx
git add src/screens/Step3MarkersScreen.tsx
git add src/screens/ReviewScreen.tsx
git add src/screens/P1Screen.tsx
git add src/screens/P2Screen.tsx
git add src/locales/en-GB.json
git add src/locales/fr-FR.json
git add src/locales/de-DE.json
git add src/locales/ru-RU.json
git add src/locales/ar-SA.json
git add src/locales/zh-CN.json
git add src/locales/ko-KR.json
git add src/locales/ja-JP.json
```

Or simply:
```bash
git add src/
```

### 2.3 Verify what's staged
```bash
git status
```
You should see:
- 12 modified files (store, navigator, 3 steps, review, 8 JSON)
- 2 new files (P1Screen.tsx, P2Screen.tsx)

### 2.4 Commit with descriptive message
```bash
git commit -m "feat(v0.5): add P1/P2 provisional input screens

- Add P1Screen: tumour size, gender, nodal mapping warning
- Add P2Screen: ECOG, PD-L1, HER2-low, LVEF, treatment intent
- Update assessmentStore: P1State, P2State, setP1, setP2, reset
- Update AppNavigator: P1 and P2 routes
- Update Step1/2/3: step counts 3→5, Step3 Next→P1
- Update ReviewScreen: provisional P1/P2 review sections
- Update all 8 locale files: p1, p2, review keys + step count updates
- P1/P2 values remain in-memory only; no API mapping
- Client-side validation per v0.5 spec (no clinical inference)

Refs: ACR_Mobile_Input_Completeness_Review_v0.5.md
Refs: ACR_Mobile_P1_P2_Validation_Mockups_v0.5.html"
```

### 2.5 View the commit
```bash
git log --oneline -1
git show --stat HEAD
```

### 2.6 Tag the release
```bash
git tag -a v0.5.0 -m "ACR Mobile Companion v0.5 — P1/P2 provisional demo extension"
```

### 2.7 Push to GitHub (via GitHub Desktop or CLI)

**Option A — GitHub Desktop:**
1. Open GitHub Desktop
2. Select the `acr-mobile-companion` repository
3. You should see the commit "feat(v0.5): add P1/P2 provisional input screens"
4. Click "Push origin" (or "Publish branch" if this is the first push)
5. The repository will be at: `github.com/KY-BChain/acr-mobile-companion`

**Option B — Command Line:**
```bash
# First time only — add remote (if not already set)
git remote add origin https://github.com/KY-BChain/acr-mobile-companion.git

# Push commit and tag
git push origin main
git push origin v0.5.0
```

---

## 3. POST-COMMIT VERIFICATION

### 3.1 Build check
```bash
cd ~/DAPP/acr-mobile-companion
npx expo start --ios
# or
npx expo start --android
```

### 3.2 Manual test checklist
| Test | Expected Result |
|------|----------------|
| Start new assessment | Step 1 of 5 shown |
| Complete Step 1, tap Next | Goes to Step 2 of 5 |
| Complete Step 2, tap Next | Goes to Step 3 of 5 |
| Complete Step 3, tap Next | Goes to **P1** screen |
| P1: enter "two point five" for tumour size | Error: "Enter a finite numeric value greater than zero" |
| P1: enter "2.5" for tumour size | Accepted |
| P1: leave gender unselected | Error shown; Next still available (demo) |
| P1: select gender, tap Next | Goes to **P2** screen |
| P2: enter ECOG = 5 | Error: "Enter a whole-number ECOG score from 0 to 4" |
| P2: enter LVEF = 120 | Error: "Enter a finite percentage from 0 to 100" |
| P2: leave optional fields empty | No errors; tap Review |
| Review screen | Shows P1 and P2 sections under "Provisional clinical-review fields" |
| Tap Submit | P1/P2 values are NOT sent in API request (check network tab) |
| Tap Cancel / go back to Welcome | All data cleared on new assessment |
| Switch language to French | All P1/P2 labels appear in French |
| Switch language to Arabic | RTL layout preserved; P1/P2 labels in Arabic |

### 3.3 Acceptance criteria evidence (AC-01 to AC-12)

| ID | Criterion | Evidence |
|----|-----------|----------|
| AC-01 | Step 1–3 behaviour preserved | Step 1/2/3 screens unchanged except step count |
| AC-02 | P1/P2 reachable and visibly provisional | Yellow banner on both screens; "Provisional extension" in subtitle |
| AC-03 | In-memory state only | No AsyncStorage, no SQLite, no file writes for P1/P2 |
| AC-04 | No API/gateway changes | `submitAssessment` payload unchanged; P1/P2 not mapped |
| AC-05 | Client validation per spec | Tumour size >0, ECOG 0–4, LVEF 0–100, enum exact match |
| AC-06 | Review shows P1/P2 distinctly | Separate "Provisional clinical-review fields" cards |
| AC-07 | 8-language selector works | All new keys in all 8 JSON files; fallback to en-GB if missing |
| AC-08 | BLOCKED state for contradictions | Nodal mapping warning shown; gender enum contract-pending |
| AC-09 | Tests cover valid/invalid cases | Manual test checklist above |
| AC-10 | Accessibility | Labels, hints, error text on all P1/P2 controls |
| AC-11 | Synthetic fixtures only | No real patient data in app or codebase |
| AC-12 | Evidence packet | This document + git diff + commit SHA |

---

## 4. CHANGED FILE INVENTORY

```
 M src/store/assessmentStore.ts        (+P1State, +P2State, +setP1, +setP2)
 M src/navigation/AppNavigator.tsx     (+P1 route, +P2 route)
 M src/screens/Step1ReceptorsScreen.tsx (step count 3→5)
 M src/screens/Step2TumourScreen.tsx   (step count 3→5)
 M src/screens/Step3MarkersScreen.tsx  (step count 3→5, Next→P1)
 M src/screens/ReviewScreen.tsx        (+Provisional P1/P2 cards)
 M src/locales/en-GB.json              (+p1, +p2, +review keys, step counts)
 M src/locales/fr-FR.json              (same, translated)
 M src/locales/de-DE.json              (same, translated)
 M src/locales/ru-RU.json              (same, translated)
 M src/locales/ar-SA.json              (same, translated)
 M src/locales/zh-CN.json              (same, translated)
 M src/locales/ko-KR.json              (same, translated)
 M src/locales/ja-JP.json              (same, translated)
 A src/screens/P1Screen.tsx            (new)
 A src/screens/P2Screen.tsx            (new)
```

---

## 5. GITHUB REPOSITORY SETUP

If the repo `github.com/KY-BChain/acr-mobile-companion` does not yet exist:

1. Go to https://github.com/new
2. Owner: `KY-BChain`
3. Repository name: `acr-mobile-companion`
4. Visibility: Private (recommended for clinical software)
5. Do NOT initialize with README (you already have one)
6. Click "Create repository"
7. GitHub will show push instructions. Use:
   ```bash
   git remote add origin https://github.com/KY-BChain/acr-mobile-companion.git
   git branch -M main
   git push -u origin main
   git push origin v0.5.0
   ```

---

## 6. NEXT STEPS AFTER THIS COMMIT

1. **iOS Simulator test**: iPhone 17 Pro iOS 26.3 — verify all 5 steps flow correctly
2. **Physical iPhone test**: iPhone 13, iPhone X, iPhone 8+ — check layout at different screen sizes
3. **iPad test**: Check if layout scales correctly (may need ScrollView adjustments)
4. **Android test**: Select physical Android phones for testing
5. **API integration**: Later campaign to map P1/P2 fields to `/api/infer` DTO (v1.0)
6. **Clinical review**: Submit to ZZU/UCD for field necessity and terminology approval
7. **Loop AI agents**: Configure autonomous runs for the "ACR Mobile" project

---

Generated: 2026-08-15
Version: v0.5 demo/testing implementation
Status: EVIDENCE READY — NOT CLINICALLY ACCEPTED
