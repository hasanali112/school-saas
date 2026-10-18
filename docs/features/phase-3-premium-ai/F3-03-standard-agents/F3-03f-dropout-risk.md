# F3-03f — Dropout Risk v1 Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03f |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S43 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Weekly, the agent ranks students by dropout risk from attendance, results, fee irregularity and age-for-class, states the reasons in Bangla and suggests an intervention (guardian call, waiver review, counselling). It replaces the rule-based at-risk list from F2-04 and populates students-to-watch.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | Weekly |
| **Reads** | Attendance, results, fee irregularity, age |
| **Proposes** | Ranked risk list with reasons; suggested intervention |
| **Default policy** | Auto with limits |

## Scope

- Transparent scoring (v1 is rule-weighted, not a black-box model) with reasons per student.
- Suggested intervention per student; interventions that involve messaging become proposals.
- List limited per run; surfaces in head mode and Student 360 summary.
- Age input requires date of birth from F1-03.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S43 | 17–28 Sep 2028 | Dropout risk v1 (ranked with reasons and interventions); at-risk lists in head mode |

## Dependencies

- **Upstream (needs):** F3-01, F1-05, F1-06, F1-07, F1-03, F3-03a, F3-03d.
- **Downstream (unblocks):** F3-04 students-to-watch, Student 360 summary.

## Acceptance criteria

- [ ] Each ranked student shows the contributing factors and source rows.
- [ ] The list respects the per-run limit and the head can dismiss an entry with a reason.
- [ ] Rule-based list in head mode is replaced, not duplicated.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Whether risk scores are visible to class teachers or only to the head.

