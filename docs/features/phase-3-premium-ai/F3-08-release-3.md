# F3-08 — Release 3.0 (Agent-native)

| Field | Value |
|---|---|
| **Feature ID** | F3-08 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | All tiers |
| **Sprints** | S49 |
| **Milestone(s)** | M8 — Phase 3 acceptance, Release 3.0 (21 Dec 2028) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §10 Definition of "agent-native" |
| **Status** | Not started |

## Summary

The Phase 3 release gate. The five-point agent-native definition must be demonstrable end to end on the demo tenant: agents are principals with data-layer permissions; they run on schedules and events unprompted; every proposal passes an approval queue or explicit policy; every run is audited with cost; the institution can pause or kill any agent instantly.

## Scope

### 1. Agent-native demonstration
- Scripted demo covering all five points of Spec v2 §10.

### 2. Documentation and demo tenant
- Technical and user documentation for Phase 3.
- Demo tenant refresh with agent activity history.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S49 | 10–21 Dec 2028 | Release 3.0 → **M8** |

## Dependencies

- **Upstream (needs):** all Phase 3 features.
- **Downstream (unblocks):** optional add-ons (S50–S52, Mar–Apr 2029).

## Acceptance criteria

- [ ] Each of the five agent-native points is shown live in the acceptance demo and recorded.
- [ ] Phase 3 acceptance sign-off recorded against M8.

## Out of scope / deferred

- Add-ons A-01 to A-05.

## Open questions

- Acceptance protocol for M8.
