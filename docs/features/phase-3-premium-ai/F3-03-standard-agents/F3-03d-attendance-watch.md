# F3-03d — Attendance Watch Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03d |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S40 |
| **Milestone(s)** | M7 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

After the school day the agent looks at the last 30 days of attendance, flags patterns (consecutive absences, falling percentage, Monday/Thursday patterns) to class teachers, and drafts absence follow-up SMS for approval. Flags go out automatically within limits; messages always need approval.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | 16:00 daily |
| **Reads** | Attendance, last 30 days |
| **Proposes** | Flags to class teachers; draft absence SMS |
| **Default policy** | Auto with limits (flags) / Always (SMS) |

## Scope

- Pattern rules and thresholds configurable per institution; stipend 75% line included.
- Flags to class teachers as in-app notifications (auto, capped per run).
- Draft absence SMS batch to guardians → approval queue (Always).
- Feeds the students-to-watch list and F3-03f.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S40 | 6–17 Aug 2028 | Attendance watch agent (flags, absence drafts) |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F1-05, F1-12, F2-06 (richer punches, optional).
- **Downstream (unblocks):** F3-03f dropout risk; F3-04 students-to-watch.

## Acceptance criteria

- [ ] A student absent three consecutive days is flagged to the class teacher the same afternoon.
- [ ] Flag volume per run never exceeds the configured limit.
- [ ] Absence SMS drafts are never sent without approval.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Interaction with the same-day absence SMS already sent by F1-05, to avoid double messaging.

