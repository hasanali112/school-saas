# F3-03i — Register Digitiser Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03i |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduLite: paid add-on; EduPlus/EduPro: included in setup |
| **Sprints** | S45 |
| **Milestone(s)** | M7a |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

The OCR-and-structure agent behind the migration studio. It reads photographs of handwritten Bangla registers and Excel exports and proposes structured student, guardian, marks and dues records with a confidence per cell, ready for review in the staged tenant.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | Manual (migration studio, F3-06) |
| **Reads** | Uploaded register photos and Excel sheets |
| **Proposes** | Structured records with per-cell confidence |
| **Default policy** | Always |

## Scope

- Bangla handwriting and printed OCR; Excel parsing with header mapping.
- Output as proposals with per-cell confidence and page/cell provenance.
- Heavy jobs priced per page (business plan §6).
- All review, cross-checks and commit live in F3-06.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S45 | 15–26 Oct 2028 | Register digitiser: OCR of Bangla registers and Excel, per-cell confidence |

## Dependencies

- **Upstream (needs):** F3-01 gateway (vision-capable model tier), F3-06 staging.
- **Downstream (unblocks):** F3-06 review and commit; A-02 scan attendance reuses the pipeline.

## Acceptance criteria

- [ ] A register page yields rows with confidence values and a link back to the image region.
- [ ] Unreadable cells are marked low-confidence rather than guessed silently.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- In-country availability of a vision model good enough for handwritten Bangla.

