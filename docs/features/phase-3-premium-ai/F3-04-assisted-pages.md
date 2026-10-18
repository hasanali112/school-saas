# F3-04 — Assisted Pages

| Field | Value |
|---|---|
| **Feature ID** | F3-04 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro (Head's Today: EduPro) |
| **Sprints** | S39, S41, S43, S44, S46 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.1 Head's today, §6.5 Status board, §6.7 Result analytics, §6.14 Due list, §6.15 Student 360, §6.17 Routine builder |
| **Status** | Not started |

## Summary

Existing Phase 1 and 2 pages gain agent-produced content in place: a ranked decision list on Head's Today, a result analytics page, anomaly flags on marks entry, drafted reminders on the status board, segmented due lists, students-to-watch, a Student 360 summary, routine options with trade-offs, drafted guardian replies with an urgent-flag rule, and homework drafts from a lesson plan. Each is a surface for a standard agent (F3-03) rather than a separate agent.

## Scope

| Assisted page | Backing agent / capability | Sprint |
|---|---|---|
| Result analytics page (`/exam/:id/analytics`) | F3-03a result analysis | S39 |
| Head's Today with ranked decision list; brief page; head-mode brief | F3-03e morning brief | S41 |
| Marks-entry anomaly detection; status-board reminder drafts | Anomaly detection over F1-06 | S43 |
| Students-to-watch; at-risk lists in head mode | F3-03f dropout risk v1 | S43 |
| Student 360 summary | Summary over F2-15 timeline | S43 |
| Due-list segments | F3-03c fee reminder | S40 (via agent) |
| Routine options with trade-offs; conflict explanation | F3-03g routine repair | S44 |
| Guardian inbox drafting with urgent-flag rule | Drafting over F2-15 inbox | S46 |
| Homework drafts from lesson plan (teacher mode) | Drafting over F1-10 | S46 |

Common rules: every agent output shows "why this" with source rows one tap away (Spec v2 §9); drafts are proposals and go through F3-02 before any message is sent.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S39 | 23 Jul–3 Aug 2028 | Result analytics page |
| S41 | 20–31 Aug 2028 | Head's Today with ranked decision list; brief page and head-mode brief |
| S43 | 17–28 Sep 2028 | Marks anomaly detection and status-board drafts; Student 360 summary; at-risk lists in head mode |
| S44 | 1–12 Oct 2028 | Routine options with trade-offs; conflict explanation |
| S46 | 29 Oct–9 Nov 2028 | Guardian inbox drafting with urgent-flag rule; homework drafts in teacher mode |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F3-03 agents, F1-06, F1-09, F1-10, F2-04, F2-15.
- **Downstream (unblocks):** none; these are end-user surfaces.

## Acceptance criteria

- [ ] Each assisted element links to the source rows that produced it.
- [ ] Anomaly detection flags an out-of-range or pattern-breaking mark before submit without blocking entry.
- [ ] A guardian message the urgent-flag rule marks urgent is surfaced to the head, not only the teacher.
- [ ] Routine options list at least two alternatives with their trade-offs when a conflict exists.
- [ ] No draft reaches a guardian without a human approving it.

## Out of scope / deferred

- Question paper and report drafting (F3-07).

## Open questions

- Definition of the urgent-flag rule (keywords, sentiment, or both) and its Bangla coverage.
- Lesson plan data source for homework drafts (not otherwise a Phase 1 or 2 entity).
