# F3-03a — Result Analysis Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03a |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduLite (the only agent on Lite), EduPlus, EduPro |
| **Sprints** | S39 |
| **Milestone(s)** | M7 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Runs automatically when a result is published and produces a cached Bangla narrative of how the class did, weak-topic notes per subject teacher and an at-risk ranking, shown on the result analytics page (F3-04). It is read-only, so it needs no approval, and it is the one agent included in EduLite.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | `result.published` event (F1-06) |
| **Reads** | Tabulation for the published exam; previous exams |
| **Proposes** | Class analysis; weak-topic report per subject teacher |
| **Default policy** | Auto (read-only) |

## Scope

- Trigger on `result.published`; run once per exam and cache the output; re-run only on unpublish/republish.
- Bangla narrative per class and per subject; comparison with previous exams.
- Weak-topic notes routed to the subject teacher (based on component/question-level marks where available).
- At-risk ranking of students by marks drop; feeds F3-03f.
- Output surfaced on the result analytics page and in Head's Today.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S39 | 23 Jul–3 Aug 2028 | Result analysis agent (cached, Bangla narrative, weak-topic notes, at-risk ranking) and result analytics page |

## Dependencies

- **Upstream (needs):** F3-01, F1-06 publish event and tabulation, F3-04 analytics page.
- **Downstream (unblocks):** F3-03f dropout risk input; F3-04 Head's Today.

## Acceptance criteria

- [ ] Analysis appears within minutes of publishing without any human trigger.
- [ ] Every statement in the narrative links to the tabulation rows behind it ("why this").
- [ ] Unpublishing invalidates the cached analysis.
- [ ] Runs on EduLite tenants with no credit deduction beyond the included allowance.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Whether question-level marks exist in Phase 1 (components are CQ/MCQ/Practical only), which limits weak-topic depth.

