# F1-09 — Class Routine

| Field | Value |
|---|---|
| **Feature ID** | F1-09 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S13 (v1), S15 (v2) |
| **Milestone(s)** | M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.17 Routine builder |
| **Status** | Not started |

## Summary

A weekly timetable grid per class-section built on the shift period timings, with teacher conflict detection, per-class and per-teacher printouts, manual substitute assignment, a workload view and change history. Phase 3 adds an agent that proposes substitutes automatically.

## Scope

### 1. Routine builder v1
- Weekly grid per class-section; period timings per shift (F1-02).
- Teacher conflict detection (same teacher, same period, two sections).
- Print per class and per teacher.

### 2. Routine v2
- Manual substitute assignment for a period.
- Teacher workload view (periods per week).
- Change history.

### 3. Consumers
- Teacher Today page (F1-10), teacher and guardian mobile modes (F2-02, F2-03).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S13 | 23 May–3 Jun 2027 | Routine builder v1 (grid, period timings per shift, conflicts, print per class and teacher) |
| S15 | 20 Jun–1 Jul 2027 | Routine v2 (substitutes, workload, history) |

## Dependencies

- **Upstream (needs):** F1-02 (shifts, sections, subjects, teacher assignments).
- **Downstream (unblocks):** F1-10 Teacher Today, F2-02, F2-03, F2-04 classes-not-taken, F3-03g routine repair agent, F3-04 routine options with trade-offs.

## Acceptance criteria

- [ ] Assigning a teacher to two sections in the same period is flagged before save.
- [ ] A per-teacher printout lists all periods across sections in Bangla.
- [ ] A substitute assignment appears in the affected teacher's Today page and is recorded in history.
- [ ] Workload view shows periods per week per teacher.

## Out of scope / deferred

- Automatic substitute proposals (F3-03g).
- Routine option generation with trade-offs and conflict explanation (F3-04).

## Open questions

- Whether the grid supports different period counts per day (e.g. shorter Thursday).
