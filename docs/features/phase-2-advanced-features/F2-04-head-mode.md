# F2-04 — Head Mode

| Field | Value |
|---|---|
| **Feature ID** | F2-04 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPro |
| **Sprints** | S26 |
| **Milestone(s)** | M4 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §7 Head app, §6.1 Head's today |
| **Status** | Not started |

## Summary

The headmaster's phone view: today's numbers, collection vs target, attendance heat, absent staff, classes not taken with a one-tap reminder, message anyone, waiver and leave approvals, and a rule-based at-risk list. Phase 3 upgrades this into the agent-native brief and approval surface.

## Scope

### 1. Today's numbers
- Attendance heat by class, collection vs target, absent staff.
- Classes not taken (period passed, attendance not marked) with one-tap reminder to the teacher.

### 2. Actions
- Message anyone (staff or guardian).
- Approve waivers (F1-07) and leave (F1-05).

### 3. At-risk list
- Rule-based (attendance below threshold, dues overdue, marks drop); no ML in Phase 2.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S26 | 21 Nov–2 Dec 2027 | Head mode: today's numbers, collection vs target, absent staff, classes not taken with reminder, message anyone, waiver and leave approvals, rule-based at-risk list |

## Dependencies

- **Upstream (needs):** F2-01, F1-05, F1-07, F1-09, F1-12.
- **Downstream (unblocks):** F3-02 approval queue with swipe in head mode, F3-03e morning brief, F3-03f dropout risk replaces the rule-based list, F3-04 Head's Today ranked decisions.

## Acceptance criteria

- [ ] Classes-not-taken list updates as periods pass and a reminder reaches the teacher in one tap.
- [ ] Approving a waiver from the phone applies it at the counter immediately.
- [ ] At-risk list shows the rule that triggered each entry.

## Out of scope / deferred

- Morning brief, agent approvals, kill switch (Phase 3).

## Open questions

- Collection target source (budget from F1-08, or manually set per month).
