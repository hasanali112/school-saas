# F2-02 — Teacher Mode

| Field | Value |
|---|---|
| **Feature ID** | F2-02 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S21, S22 |
| **Milestone(s)** | M4 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §7 Teacher app, §6.2 Teacher's today, §6.3 Take attendance |
| **Status** | Not started |

## Summary

The teacher's mobile experience: today's periods with one-tap offline attendance, offline marks entry, homework setting, assignment review, routine, notices, student lookup and leave application. Tested on low-end devices because that is what most teachers carry.

## Scope

### 1. Teacher mode I (S21)
- Today's periods from F1-09.
- One-tap offline attendance per period with sync status.
- Routine, notices, student lookup, leave application.
- Low-end device testing.

### 2. Teacher mode II (S22)
- Offline marks entry with autosave and submit (same rules as F1-06).
- Set homework with attachments; attachment compression on device.
- Review assignment submissions.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S21 | 12–23 Sep 2027 | Teacher mode I: today's periods, one-tap offline attendance, routine, notices, student lookup, leave application; low-end device testing |
| S22 | 26 Sep–7 Oct 2027 | Teacher mode II: offline marks entry, set homework, review assignments, attachment compression |

## Dependencies

- **Upstream (needs):** F2-01 platform, F1-05, F1-06, F1-09, F1-10.
- **Downstream (unblocks):** F3-04 homework drafts and guardian-inbox drafting in teacher mode, A-01 voice attendance, A-02 scan attendance and mark sheets.

## Acceptance criteria

- [ ] A teacher marks a full section present with one tap and adjusts absentees; works in airplane mode and syncs later.
- [ ] Marks entered offline are locked on submit and appear on the web status board after sync.
- [ ] Homework photo attachments are compressed before upload.
- [ ] App is usable on a 2 GB RAM Android 8 device in the low-end test.

## Out of scope / deferred

- Voice and scan attendance (A-01, A-02).
- Agent-drafted homework and guardian messages (F3-04).

## Open questions

- Whether teachers can view marks of sections they are not assigned to (Spec v2 §2 implies no).
