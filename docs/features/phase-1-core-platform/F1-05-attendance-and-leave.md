# F1-05 — Attendance & Leave

| Field | Value |
|---|---|
| **Feature ID** | F1-05 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S3, S4 (offline PWA) |
| **Milestone(s)** | M1 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.3 Take attendance, §8 Offline |
| **Status** | Not started |

## Summary

Student and staff attendance with the rules a Bangladeshi school actually needs: once-daily or per-period, same-day edit only, admin-only backdating, and a 75% stipend eligibility report. Delivered as a web page plus an offline-capable PWA so teachers can mark attendance without connectivity. Leave applications and approvals for staff and students ride on the same module.

## Scope

### 1. Attendance entry
- Institution-level mode: once daily or per period.
- Web page and an offline-capable PWA with **visible sync status**.
- Rules: teachers see assigned classes only; edits allowed same day; backdating is admin-only; every change fully audited.
- Attendance entry blocked on holidays (F1-02 calendar).

### 2. Registers and reports
- Monthly attendance register per section.
- Monthly percentage report with **stipend eligibility (75%)** flag.

### 3. Staff attendance
- Daily staff attendance (manual in Phase 1; biometric feed arrives in F2-06).

### 4. Leave
- Leave types configurable per institution.
- Applications and approvals for staff and students.
- `leave.approved` event emitted (consumed by F3-03g routine repair agent).

### 5. Notifications
- Absence SMS to guardians (sending logic in F1-12, S4).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S3 | 25 Oct–5 Nov 2026 | Attendance (daily or per-period) on web; monthly register; monthly % and stipend (75%) report; staff attendance; leave types, apply and approve |
| S4 | 8–19 Nov 2026 | Offline PWA attendance with sync status; absence SMS |

## Dependencies

- **Upstream (needs):** F1-02 (teacher assignments, shifts, calendar), F1-03 (students), F1-12 (absence SMS).
- **Downstream (unblocks):** F1-13 attendance reports, F2-02 teacher mode one-tap attendance, F2-06 biometric, F3-03d attendance watch agent, F3-03f dropout risk, A-01 voice attendance, A-02 scan attendance.

## Acceptance criteria

- [ ] A subject teacher can mark attendance only for sections they are assigned to.
- [ ] Yesterday's attendance cannot be edited by a teacher; an admin can, and the audit row records it.
- [ ] Attendance marked offline in the PWA syncs when connectivity returns and the UI shows pending/synced state.
- [ ] Monthly percentage report flags every student below 75% for stipend purposes.
- [ ] A staff leave application can be approved by the head and the day shows as leave in staff attendance.
- [ ] Absence SMS is generated for absentees with a cost preview before sending.

## Out of scope / deferred

- Biometric device punches (F2-06).
- Mobile app one-tap attendance (F2-02).
- Voice and scan attendance (A-01, A-02).
- Attendance watch agent flags and drafted SMS (F3-03d).

## Open questions

- Conflict rule when the same period is marked on two devices offline (Spec v2 §8 says last-writer-wins per cell with both retained; confirm it applies to attendance).
- Whether per-period mode is per shift or per institution.
