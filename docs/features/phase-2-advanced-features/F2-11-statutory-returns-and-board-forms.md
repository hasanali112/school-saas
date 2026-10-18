# F2-11 — Statutory Returns & Board Forms

| Field | Value |
|---|---|
| **Feature ID** | F2-11 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S30, S31 |
| **Milestone(s)** | M5a — statutory returns and board forms complete (13 Apr 2028) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.26 Statutory returns |
| **Status** | Not started |

## Summary

Pre-filled government paperwork: BANBEIS annual survey, DSHE monthly return, stipend eligibility list and MPO staff statement, with unknown fields highlighted and export in the accepted layouts. Plus board registration and form fill-up with e-SIF export. Phase 3 adds an agent that prepares these on the calendar.

## Scope

### 1. Returns
- BANBEIS annual survey.
- DSHE monthly return.
- Stipend eligibility list (from F1-05 75% rule and F1-07 dues).
- MPO staff statement (from F2-08).
- Pre-fill from system data; **unknowns highlighted** for manual completion; export in exact accepted layouts.

### 2. Board forms
- Board registration and form fill-up: board layout, photo specs, eligibility rules.
- e-SIF export.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S30 | 19–30 Mar 2028 | BANBEIS annual survey, DSHE monthly return, stipend eligibility list, MPO staff statement; pre-fill with unknowns highlighted; exact export layouts |
| S31 | 2–13 Apr 2028 | Board registration and form fill-up (board layout, photo specs, eligibility, e-SIF export) → **M5a** |

## Dependencies

- **Upstream (needs):** F1-03, F1-05, F1-06, F1-07, F1-13, F2-08.
- **Downstream (unblocks):** F3-03k statutory return prep agent.

## Acceptance criteria

- [ ] Each return exports in the layout accepted by the receiving authority, verified against a real submitted copy.
- [ ] Fields the system cannot derive are visibly highlighted and the form cannot be marked complete until they are filled.
- [ ] e-SIF export validates against the board's importer for a full class.

## Out of scope / deferred

- Direct electronic submission to government portals.

## Open questions

- Which boards (Dhaka, Rajshahi, etc.) and whether e-SIF formats differ between them.
- Current-year BANBEIS/DSHE form versions; layouts change annually.
