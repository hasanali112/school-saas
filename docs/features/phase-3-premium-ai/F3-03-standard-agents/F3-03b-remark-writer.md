# F3-03b — Remark Writer Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03b |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S39 |
| **Milestone(s)** | M7 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Drafts a short Bangla remark for every report card after a result is published, taking marks, attendance and previous remarks into account. Remarks are reviewed as a batch by the class teacher and only approved remarks print on the report card.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | `result.published` event (F1-06) |
| **Reads** | Per-student marks, attendance, previous remarks |
| **Proposes** | A Bangla remark per report card |
| **Default policy** | Batch |

## Scope

- Trigger on `result.published`; one proposal batch per section.
- Per-item edit and skip in the approval queue (F3-02); class teacher reviews their own sections.
- Approved remarks are written to the report card by the service, then batch PDF (F1-06) includes them.
- Tone guidance and length limits in the Bangla prompt template.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S39 | 23 Jul–3 Aug 2028 | Remark writer (batch review, approved remarks on report cards) |

## Dependencies

- **Upstream (needs):** F3-01, F3-02 batch policy, F1-06 report cards, F1-05 attendance.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] A batch of remarks for a 60-student section is reviewable in one screen with edit and skip per row.
- [ ] Only approved remarks appear on the printed report card; unapproved rows print blank.
- [ ] Previous remarks are visible beside the draft for consistency.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Whether the head can approve on behalf of a class teacher who has not reviewed before the report-card print date.

