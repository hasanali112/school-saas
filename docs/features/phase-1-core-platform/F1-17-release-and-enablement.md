# F1-17 — Release & Enablement (EduLite 1.0)

| Field | Value |
|---|---|
| **Feature ID** | F1-17 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | All tiers |
| **Sprints** | S18 (hardening), S19 |
| **Milestone(s)** | M3 — Phase 1 acceptance, EduLite 1.0, 26 Aug 2027 |
| **Spec v2 reference** | business-plan-v2.md §10 Onboarding & migration playbook |
| **Status** | Not started |

## Summary

Everything needed to go from "feature complete" to "sellable and onboardable": the verification-day diff tool that compares an institution's tabulation with the system, Bangla import templates, a demo tenant, in-app help, tier configuration, hardening and documentation.

## Scope

### 1. Verification-day diff tool
- Load the institution's own tabulation sheet and diff it against system results cell by cell; part of the onboarding playbook.

### 2. Enablement assets
- Bangla import templates for students, staff, fees and marks.
- Demo tenant with realistic seed data for the eight-minute demo (business plan §9).
- In-app help links per page.

### 3. Tier configuration
- Lite / Plus / Pro entitlement definitions applied by F1-01 platform admin.

### 4. Hardening (S18)
- Load, concurrency, restore drill, security review, Bangla print QA on real printers, monitoring and runbooks (detailed in F1-01).

### 5. Documentation
- Technical documentation and user documentation in Bangla.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S18 | 1–12 Aug 2027 | Hardening |
| S19 | 15–26 Aug 2027 | Verification-day diff tool; Bangla import templates; demo tenant; in-app help links; tier configuration (Lite/Plus/Pro); technical debt; documentation → **M3** |

## Dependencies

- **Upstream (needs):** all Phase 1 features.
- **Downstream (unblocks):** Phase 2 start; F3-06 migration studio reuses the verification-day comparison.

## Acceptance criteria

- [ ] Diff tool highlights every mismatch between an uploaded tabulation and system results.
- [ ] Demo tenant supports the full eight-minute demo script without manual setup.
- [ ] Every page has a help link that resolves to Bangla documentation.
- [ ] Phase 1 acceptance sign-off recorded against M3.

## Out of scope / deferred

- Play Store release (F2-17).

## Open questions

- Acceptance test protocol for M3 (who signs, on which tenant, against which checklist).
