# F2-12 — Committee Portal

| Field | Value |
|---|---|
| **Feature ID** | F2-12 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPro |
| **Sprints** | S31 |
| **Milestone(s)** | M5a |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.25 Committee portal, §2 (Committee Member role) |
| **Status** | Not started |

## Summary

A read-only portal for the governing body: monthly summary, head's report, meeting calendar, minutes archive and a resolutions tracker. Committee members never see individual student records.

## Scope

### 1. Content
- Monthly summary (attendance, collection, expenses from F1-13 and F1-08).
- Head's report (authored by the head; drafted by an agent in Phase 3).
- Meeting calendar; minutes archive; resolutions tracker with status.

### 2. Access
- Committee Member role, read-only, aggregate data only.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S31 | 2–13 Apr 2028 | Committee portal (read-only summary, head's report, meeting calendar, minutes archive, resolutions) |

## Dependencies

- **Upstream (needs):** F1-02 roles, F1-08, F1-13.
- **Downstream (unblocks):** F3-07 committee monthly report drafting, A-05 minutes from recording.

## Acceptance criteria

- [ ] A committee member cannot open any student profile or list.
- [ ] A resolution can be marked pending / done with a date and appears in the tracker.
- [ ] Minutes upload accepts PDF and is searchable by meeting date.

## Out of scope / deferred

- Committee voting or e-signature.

## Open questions

- Whether committee members log in via the web only or also the mobile app.
