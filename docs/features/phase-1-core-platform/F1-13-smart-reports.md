# F1-13 — Smart Reports

| Field | Value |
|---|---|
| **Feature ID** | F1-13 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S15 |
| **Milestone(s)** | M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.27 Custom report builder (Phase 2 successor) |
| **Status** | Not started |

## Summary

A report centre with the fixed reports every office needs, exportable to Excel and PDF on letterhead, and schedulable. Phase 2 adds a visual builder; Phase 3 adds natural-language reports.

## Scope

### 1. Report catalogue
- Attendance: monthly, by class.
- Collection: daily, monthly, head-wise.
- Dues ageing.
- Result summary.
- Student strength by class, gender, religion and age.
- Staff list.
- SMS usage.

### 2. Output
- Excel and PDF export; letterheaded print.
- Scheduled reports (e.g. monthly attendance emailed/shown to the head).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S15 | 20 Jun–1 Jul 2027 | Report centre (attendance, collection, dues ageing, result summary, student strength, staff, SMS usage); Excel and PDF export; scheduled reports |

## Dependencies

- **Upstream (needs):** F1-05, F1-06, F1-07, F1-12, F1-11 (PDF pipeline).
- **Downstream (unblocks):** F2-14 custom report builder, F2-12 committee monthly summary, F2-11 statutory returns (student strength by category), F3-07 natural-language reports.

## Acceptance criteria

- [ ] Each listed report renders for a chosen period and class filter and exports to both Excel and PDF.
- [ ] Student strength report breaks down by class, gender, religion and age band.
- [ ] A scheduled report runs on schedule and is available in the report centre history.

## Out of scope / deferred

- User-defined reports (F2-14).
- Statutory layouts (F2-11).

## Open questions

- Delivery channel for scheduled reports (in-app only vs email; email is not otherwise in scope).
