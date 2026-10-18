# A-02 — Scan Attendance & Mark Sheets (Add-on)

| Field | Value |
|---|---|
| **Feature ID** | A-02 |
| **Phase** | Optional add-on (quoted separately) |
| **Tier availability** | Add-on for EduPlus / EduPro |
| **Sprints** | S50 |
| **Milestone(s)** | — (post-M8) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §7 Teacher app ("marks entry with mark-sheet scan") |
| **Status** | Not started (optional) |

## Summary

Photograph a paper attendance register or mark sheet in teacher mode; the app proposes attendance or marks with per-cell confidence, and the teacher confirms cell by cell before anything is saved. Reuses the register digitiser pipeline (F3-03i).

## Scope

- Photo capture with guide overlay; on-device compression.
- OCR to proposals with per-cell confidence.
- Cell-by-cell confirm; low-confidence cells first.
- Saved through the normal attendance (F1-05) and marks (F1-06) rules, including submit and lock.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S50 | 4–15 Mar 2029 | Scan attendance and mark sheets |

## Dependencies

- **Upstream (needs):** F2-02, F3-03i OCR pipeline, F1-05, F1-06.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] A photographed mark sheet for a section yields marks with confidence per cell.
- [ ] Nothing is saved until every low-confidence cell is confirmed or corrected.
- [ ] Sheet images are purged after confirmation per retention policy.

## Out of scope / deferred

- Answer-script scanning (Spec v2 §6.11, Phase 4).

## Open questions

- Per-page pricing for scans (business plan §6).
