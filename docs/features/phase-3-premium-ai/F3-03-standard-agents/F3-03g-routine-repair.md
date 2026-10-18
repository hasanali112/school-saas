# F3-03g — Routine Repair Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03g |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S44 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

When a teacher's leave is approved, the agent proposes substitutes for each affected period, explains conflicts, and offers routine options with their trade-offs (workload, subject match, free periods). The routine owner approves and the substitute assignment (F1-09 v2) is written by the service.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | `leave.approved` event (F1-05) |
| **Reads** | Routine, teacher availability, workload |
| **Proposes** | Substitute assignment proposal; routine options with trade-offs |
| **Default policy** | Always |

## Scope

- Trigger on `leave.approved`; also manual from the routine builder.
- Candidate substitutes ranked by subject match, free period and workload (F1-09 workload view).
- Options with trade-offs and conflict explanation surfaced in the routine builder (F3-04).
- Notifies the substitute after approval via push (F2-01).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S44 | 1–12 Oct 2028 | Routine repair agent (substitutes on approved leave); routine options with trade-offs; conflict explanation |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F1-05 leave events, F1-09 v2.
- **Downstream (unblocks):** F3-04 routine options.

## Acceptance criteria

- [ ] Within minutes of a leave approval, a substitute proposal exists for every affected period.
- [ ] Each option lists its trade-offs and any remaining conflict.
- [ ] Nothing changes in the routine until approved.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Whether the agent may also propose swaps that change other teachers' periods.

