# ACR Mobile Companion

React Native + TypeScript source for ACR Mobile Companion v0.6.0 Build 44,
including its thin same-backend gateway, versioned contracts and integration
tests. The repository is sufficient to reinstall dependencies and rebuild the
iOS and Android applications; generated dependencies and build outputs are not
stored in Git.

## Scope

- **Transport/UI-only** mobile app (iOS & Android); clinical inference remains platform-owned
- In-memory assessment flow — no persistence, no AsyncStorage
- Live Platform and explicit synthetic demonstration channels under `/m/v1`
- No Phase 4 / governance / federated learning surfaces
- Fail-closed attestation per ACR-DD-014 §3.2 & §6.4

## Documents Referenced

- `ACR-DD-013_Mobile_App_Design_v0.7.md` — visual specification
- `ACR_Mobile_Mockup_iPhone_v0.7.html` — 9-screen static layout reference
- `ACR-DD-014_Backend_API_Specification_v0.1.md` — `/m/v1` contract, attestation, error envelope

## Project Structure

```
src/
  api/           — Fetch wrappers for /m/v1 routes
  components/    — Reusable ACR UI primitives
  navigation/    — React Navigation stack
  screens/       — 9 screens matching mockup
  store/         — Zustand in-memory state
  theme/         — ACR color tokens & typography
  types/         — TypeScript contracts from ACR-DD-014
  utils/         — UUID generators
App.tsx          — Entry point
gateway/         — Thin authentication/validation/transport interface
schemas/         — Versioned request, response, error and attestation contracts
e2e/             — Same-backend and explicit-replay integration tests
docs/             — current v0.6.6 (Build 47) documents: clinical/, operations/, build47-evidence/
docs/archive/     — earlier releases (v0.5, Build 44, 45, 46) and early project notes
```

## Getting Started

```bash
# Install mobile dependencies
npm install

# iOS (Xcode)
npx expo run:ios

# Android
npx expo run:android

# Install and verify the gateway
cd gateway
npm ci
npm test
```

## Xcode Review

Open `ios/ACRMobileCompanion.xcworkspace` in Xcode after the first `expo run:ios`.

## Key Constraints (from spec)

1. **No patient identifiers** — no name, DOB, MRN, address, phone, email, free text
2. **No persistence** — assessment lives in memory only; leaving Result screen clears it
3. **No analytics / crash reporting** — wave one requirement
4. **No OTA updates** — every change requires a new reviewed build
5. **Attestation gate** — `POST /m/v1/infer` blocked unless `VERIFIED`
6. **No client-side clinical logic** — thresholds, classification, recommendations are server-side only
7. **Full precision confidence** — displayed as returned, not rounded
8. **Ontology hash visible** — provenance rendered unchanged

## Screens Implemented

| # | Screen | Mockup | API Interaction |
|---|--------|--------|-----------------|
| 1 | Welcome / Consent | Screen 1 | — |
| 2 | Step 1 — Receptors | Screen 2 | — |
| 3 | Step 2 — Tumour | Screen 3 | — |
| 4 | Step 3 — Markers | Screen 4 | — |
| 5 | Review | Screen 5 | `GET /m/v1/attestation` |
| 6 | Result | Screens 6–7 | `POST /m/v1/infer` |
| 7 | About | Screen 8 | — |
| 8 | Fail-closed | Screen 9 | `GET /m/v1/attestation` |

## Environment

The reviewed Build 44 endpoint policy is defined in `src/config/gateway.ts`.
Any endpoint or network-security change requires a new reviewed native build.
See `gateway/README.md` for gateway configuration and fixture policy.

## Build Identity

- Marketing version: `0.6.0`
- Native build: `44`
- Response contract: `m1`
- Reasoner: `v2.2.1`
- Reasoning mode: `OPENLLET_SWRL`

Build 44 is a controlled evaluation build for synthetic or explicitly
authorised non-patient test data. It is not approved for diagnosis, treatment
decisions, public distribution or unsupervised clinical use.
