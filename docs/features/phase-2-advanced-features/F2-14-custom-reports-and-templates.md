# F2-14 — Custom Reports & Templates

| Field | Value |
|---|---|
| **Feature ID** | F2-14 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S33 |
| **Milestone(s)** | M6 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.27 Custom report builder |
| **Status** | Not started |

## Summary

A visual report builder (entity → fields → filters → grouping; save, schedule, letterhead) and a document template editor with a merge-field picker, so institutions stop asking for one-off reports and certificates.

## Scope

### 1. Report builder
- Pick an entity (students, attendance, collections, marks, staff), choose fields, filters, grouping and sort.
- Save as a named report; schedule; print on letterhead; export Excel/PDF.
- Respects role permissions; no field outside the user's scope.

### 2. Document template editor
- Edit F1-11 templates with a merge-field picker; preview with a real record.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S33 | 30 Apr–11 May 2028 | Custom report builder; document template editor with merge-field picker |

## Dependencies

- **Upstream (needs):** F1-13, F1-11.
- **Downstream (unblocks):** F3-07 natural-language report builder (generates builder definitions), F3-05 ask-your-data semantic layer shares the entity model.

## Acceptance criteria

- [ ] A user builds "students with attendance below 75% and dues above ৳1,000" without SQL and saves it.
- [ ] A saved report scheduled monthly appears in the report centre history.
- [ ] A template edit with a new merge field renders correctly on the next certificate.

## Out of scope / deferred

- Cross-entity joins beyond the predefined relationships.

## Open questions

- Whether custom reports can be shared with the committee portal.
