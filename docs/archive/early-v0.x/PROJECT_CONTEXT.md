# ACR Mobile Companion — Project Context

## Baseline State
- iOS simulator: iPhone 16/17 Pro, iOS 26.3 — UI rendering correctly
- Stack: Expo SDK + React Native + TypeScript + Zustand
- Local path: ~/DAPP/acr-mobile-companion/
- Repo: github.com/KY-BChain/acr-mobile-companion

## P-Levels
- P0: i18n (8 languages, RTL) — IN PROGRESS
- P1: Backend API integration (/m/v1) — QUEUED
- P2: Multi-device testing (iPhone 13, X, 8+, iPad, Android) — QUEUED
- P3: GitHub repo + CI/CD — USER HANDLING
- P4: /loop agent autonomy setup — QUEUED

## API Spec
- Document: ACR-DD-014_Backend_API_Specification_v0.1.md
- Mock server: ~/DAPP/acr-mobile-companion-extended/gateway/
- Real backend: VPS at [update when known]

## Key Constraints
- NO clinical data persistence (memory only)
- Attestation must be VERIFIED before infer
- patientId = mob-&lt;uuidv4&gt;, fresh per assessment
- Confidence pin: 0.6001915864330829 for Luminal B