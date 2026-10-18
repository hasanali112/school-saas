# F1-16 — Agent-ready Hooks

| Field | Value |
|---|---|
| **Feature ID** | F1-16 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | All tiers (internal architecture) |
| **Sprints** | S0 (event tables), S17 |
| **Milestone(s)** | M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §1 Design principle, §3 Agent operating layer, §8 Pseudonymised inference |
| **Status** | Not started |

## Summary

Architectural commitments made in Phase 1 so that Phase 3 agents plug in without rework: every module emits events, a proposals-and-approvals schema exists from the start, and read APIs can return pseudonymous identifiers instead of names.

## Scope

### 1. Event emission
- Every module emits domain events to the event table (e.g. `attendance.marked`, `result.published`, `leave.approved`, `counter.closed`, `consent.changed`).
- Event payloads are versioned.

### 2. Proposals and approvals schema
- Tables for proposal, proposal item, approval decision, with reason and cost fields, ready for F3-02.
- No UI in Phase 1.

### 3. Pseudonymous identifiers
- Read APIs can return roll/section-based identifiers in place of names (Spec v2 §8) so model inputs never carry names by default.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S0 | 13–24 Sep 2026 | Audit and event tables |
| S17 | 18–29 Jul 2027 | Agent-ready hooks (events emitted from every module, proposals and approvals schema, pseudonymous IDs) |

## Dependencies

- **Upstream (needs):** F1-01, and every Phase 1 module as an event source.
- **Downstream (unblocks):** F2-15 Student 360 timeline (built from the event log), F3-01 agent operating layer, F3-02 approval queue, all standard agents.

## Acceptance criteria

- [ ] Each Phase 1 module has a documented list of emitted events, and each fires in an integration test.
- [ ] A proposal can be created, itemised, approved and rejected via the API with reasons recorded.
- [ ] A read API called with the pseudonymise flag returns no names or phone numbers.

## Out of scope / deferred

- Agent registry, tokens, orchestration (F3-01).
- Approval queue UI (F3-02).

## Open questions

- Event retention period and whether events are subject to PDPA deletion.
