# F2-06 — Biometric Attendance

| Field | Value |
|---|---|
| **Feature ID** | F2-06 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro (device sold at cost plus margin) |
| **Sprints** | S25 |
| **Milestone(s)** | M4 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.24 Integrations hub |
| **Status** | Not started |

## Summary

ZKTeco devices push punches over ADMS to the platform; punches become student and staff attendance by per-shift rules (first-in, last-out, late threshold). Store-and-forward and USB log import cover connectivity gaps. A device health page shows what is online.

## Scope

### 1. Device integration
- ZKTeco ADMS push endpoint.
- Device registration per institution; student and staff mapping to device user IDs.

### 2. Punch-to-attendance rules
- First-in / last-out; late threshold per shift; holiday awareness (F1-02).
- Writes into F1-05 attendance with source = biometric.

### 3. Resilience
- Store-and-forward on the device; USB log import for offline devices.
- Device health page (last sync, punch count, online status).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S25 | 7–18 Nov 2027 | ZKTeco ADMS push endpoint, device registration, user mapping, punch-to-attendance rules, store-and-forward, USB log import, devices page |

## Dependencies

- **Upstream (needs):** F1-05, F1-02 (shifts), F2-07 (device cards).
- **Downstream (unblocks):** F3-03d attendance watch (richer data), F2-08 payroll leave-balance link.

## Acceptance criteria

- [ ] A punch from a registered device marks the mapped student present within one sync cycle.
- [ ] A punch after the shift's late threshold marks late.
- [ ] A USB log export from an offline device imports without duplicating punches already received.
- [ ] Health page shows a device that has not synced in the configured window as offline.

## Out of scope / deferred

- Non-ZKTeco vendors.

## Open questions

- Whether teacher-marked attendance overrides biometric or vice versa when both exist.
