# F2-01 — Mobile App Platform (one app, four modes)

| Field | Value |
|---|---|
| **Feature ID** | F2-01 |
| **Phase** | Phase 2 — Advanced Features (EduPlus / EduPro) |
| **Tier availability** | EduPlus, EduPro (head mode: EduPro only) |
| **Sprints** | S20, S22 (internal track), S26 (Play Store v1), S28 (stress, crash monitoring) |
| **Milestone(s)** | M4 (mobile app in production, 2 Dec 2027) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §7 Mobile apps, §8 Offline |
| **Status** | Not started |

## Summary

A single Flutter app for Android 8+ under 30 MB that switches between teacher, guardian, head (and later student) modes based on the logged-in principal. Provides the shared plumbing every mode needs: OTP and biometric login, an offline store with a sync engine and conflict rule, push notifications with an SMS-fallback rule, and guardian–child linking by phone.

## Scope

### 1. App foundation
- Flutter; Android 8+; installed size under 30 MB.
- Role modes selected after login; one binary.
- Bangla first; per-user language toggle.

### 2. Authentication
- Phone + OTP; biometric unlock after first login.

### 3. Offline store and sync engine
- Local store for entry screens (attendance, marks).
- Queued writes; delta sync API.
- Conflict rule: last-writer-wins **per cell**, both versions retained in audit (Spec v2 §8).
- Visible sync status on every entry screen.

### 4. Push notifications
- Push for notices, results, dues, approvals.
- **SMS-fallback rule**: a delivered app notification incurs no SMS cost; SMS is sent only when the guardian has no app or push is undelivered within a window.

### 5. Guardian–child linking
- Link by guardian phone against F1-03 guardian records; multi-child support.

### 6. Release engineering
- Play Store internal-testing track (S22), production release v1 with Bangla listing (S26).
- Sync stress tests and crash monitoring (S28).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S20 | 29 Aug–9 Sep 2027 | Flutter app foundation; phone + OTP and biometric login; local store; offline sync engine; mobile API and delta sync; push with SMS-fallback rule; guardian–child linking |
| S22 | 26 Sep–7 Oct 2027 | Play Store internal-testing track |
| S26 | 21 Nov–2 Dec 2027 | Play Store production release v1 with Bangla listing → **M4** |
| S28 | 19–30 Dec 2027 | Sync stress tests; crash monitoring |

## Dependencies

- **Upstream (needs):** F1-01 auth, F1-03 guardians, F1-12 SMS (fallback), F1-15 consent (app purpose).
- **Downstream (unblocks):** F2-02 teacher mode, F2-03 guardian mode, F2-04 head mode, F2-05 pay-now, F3-02 head-mode approvals, F3-05 mobile command bar, add-ons A-01/A-02/A-03.

## Acceptance criteria

- [ ] Release APK/AAB installs on an Android 8 device and is under 30 MB.
- [ ] A guardian with two children at the institution sees both after one OTP login.
- [ ] Attendance marked offline on two devices for the same cell resolves to the later write, and audit shows both.
- [ ] A notice delivered by push does not generate an SMS; a guardian without the app receives the SMS.
- [ ] Crash-free sessions are tracked in a monitoring dashboard.

## Out of scope / deferred

- iOS build (not in scope of these phases).
- Student mode (Spec v2 §7 describes it; not scheduled; A-03 study helper implies it later).

## Open questions

- Push provider (FCM) and behaviour on Chinese-OEM devices with aggressive battery killers.
- Push-undelivered window before SMS fallback fires.
