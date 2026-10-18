# F3-03k — Statutory Return Prep Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03k |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S47 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Ahead of each statutory deadline the agent prepares the return in F2-11, fills what the system knows, highlights unknowns, explains derivations, and submits the draft to the approval queue for the admin officer to complete and export.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | Calendar (return due dates) |
| **Reads** | Whole institution (students, staff, attendance, results, finance) |
| **Proposes** | Pre-filled BANBEIS/DSHE/stipend/MPO forms with unknowns highlighted |
| **Default policy** | Always |

## Scope

- Calendar of return due dates per authority; run N days before.
- Uses F2-11 layouts; derivation notes per filled field.
- Unknowns highlighted and listed as tasks.
- Approval, then export in accepted layout.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S47 | 12–23 Nov 2028 | Statutory return prep agent |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F2-11.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] A draft DSHE monthly return exists in the queue before the configured lead time.
- [ ] Every filled field can show how it was derived.
- [ ] Export is blocked until unknowns are resolved and the draft is approved.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Source of the statutory calendar (platform-maintained vs per tenant).

