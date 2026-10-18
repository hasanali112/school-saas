# F2-17 — Release 2.x

| Field | Value |
|---|---|
| **Feature ID** | F2-17 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | All tiers |
| **Sprints** | S28 (Release 2.0), S36 (Release 2.x) |
| **Milestone(s)** | M5 — Release 2.0 EduPlus/EduPro sellable (30 Dec 2027); M6 — Phase 2 acceptance (22 Jun 2028) |
| **Spec v2 reference** | — |
| **Status** | Not started |

## Summary

The two Phase 2 release gates. Release 2.0 at the end of 2027 makes EduPlus and EduPro sellable for the January signing season; Release 2.x in June 2028 closes Phase 2 with regression, performance, security review, an app-store update and documentation. Includes plan-change preview so a tenant can see what upgrading a tier unlocks.

## Scope

### 1. Release 2.0 (S28)
- Plan-change preview (what changes when moving Lite → Plus → Pro).
- Sync stress tests; crash monitoring (F2-01).
- Release 2.0 build → M5.

### 2. Release 2.x (S36)
- Regression; performance; security review; app-store update; documentation → M6.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S28 | 19–30 Dec 2027 | Plan-change preview; sync stress tests; crash monitoring; release 2.0 → **M5** |
| S36 | 11–22 Jun 2028 | Hardening and release 2.x: regression, performance, security review, app store update, documentation → **M6** |

## Dependencies

- **Upstream (needs):** all Phase 2 features.
- **Downstream (unblocks):** Phase 3 start.

## Acceptance criteria

- [ ] Plan-change preview lists exactly the features that will appear for the target tier.
- [ ] Regression suite passes for Phase 1 and Phase 2 modules.
- [ ] Phase 2 acceptance sign-off recorded against M6.

## Out of scope / deferred

- Nothing; this is a release gate.

## Open questions

- Acceptance protocol for M6.
