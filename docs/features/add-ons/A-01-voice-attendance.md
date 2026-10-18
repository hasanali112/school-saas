# A-01 — Voice Attendance (Add-on)

| Field | Value |
|---|---|
| **Feature ID** | A-01 |
| **Phase** | Optional add-on (quoted separately) |
| **Tier availability** | Add-on for EduPlus / EduPro (requires teacher mode) |
| **Sprints** | S50 |
| **Milestone(s)** | — (post-M8) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §7 Teacher app ("voice and scan") |
| **Status** | Not started (optional) |

## Summary

In teacher mode, the teacher reads out absent roll numbers in Bangla; the app converts speech to roll numbers, reads them back for confirmation, and marks attendance. Works with the offline queue where the speech model permits.

## Scope

- Bangla speech-to-roll-number recognition.
- Read-back confirmation before marking.
- Falls through to one-tap attendance (F2-02) on failure.
- Audio is not retained after recognition (PDPA).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S50 | 4–15 Mar 2029 | Voice attendance |

## Dependencies

- **Upstream (needs):** F2-02 teacher mode, F1-05, F3-01 gateway (speech model).
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] Bangla digits spoken in a classroom recording are recognised and read back correctly in the test set.
- [ ] A misheard number can be corrected before marking.
- [ ] No audio is stored after the attendance is saved.

## Out of scope / deferred

- Voice for marks entry.

## Open questions

- On-device vs server speech model, and offline behaviour.
