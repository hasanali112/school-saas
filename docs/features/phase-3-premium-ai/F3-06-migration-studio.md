# F3-06 — Migration Studio

| Field | Value |
|---|---|
| **Feature ID** | F3-06 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduLite: paid add-on; EduPlus/EduPro: included in setup |
| **Sprints** | S45, S46 |
| **Milestone(s)** | M7a — Migration studio complete (9 Nov 2028) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.22 Migration studio; business-plan-v2.md §10 Onboarding |
| **Status** | Not started |

## Summary

Turns register photos and Excel into structured proposals with per-cell confidence, detects duplicates, cross-checks dues vs receipts and roll continuity, stages the result in a sandbox tenant, lets the office review by confidence, runs the verification-day comparison and commits. This is the onboarding bottleneck-remover the business plan depends on.

## Scope

### 1. Ingestion (register digitiser agent, F3-03i)
- OCR of Bangla registers (photos) and Excel sheets.
- Per-cell confidence; structured proposals.

### 2. Quality checks
- Duplicate detection; cross-checks (dues vs receipts, roll continuity).

### 3. Staging and review
- Staged tenant; review by confidence band; per-cell confirm.

### 4. Verification and commit
- Verification-day comparison (reuses F1-17 diff tool).
- Commit to the live tenant through the approval queue.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S45 | 15–26 Oct 2028 | Register digitiser and migration studio I: OCR of Bangla registers and Excel, per-cell confidence, duplicate detection, cross-checks, staged tenant, review by confidence |
| S46 | 29 Oct–9 Nov 2028 | Migration studio II: verification-day comparison, commit → **M7a** |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F3-03i, F1-03, F1-17 diff tool.
- **Downstream (unblocks):** faster onboarding; A-02 scan attendance shares the OCR pipeline.

## Acceptance criteria

- [ ] A photographed Bangla admission register page becomes rows with a confidence value on every cell.
- [ ] Low-confidence cells are grouped for review first; high-confidence cells can be bulk-accepted.
- [ ] A duplicate student across two register pages is flagged before commit.
- [ ] Commit writes to the live tenant only after approval and is fully audited.

## Out of scope / deferred

- Migration from competitor ERP exports beyond Excel.

## Open questions

- OCR model choice for handwritten Bangla and its in-country availability.
- Pricing per page for heavy jobs (business plan mentions per-page pricing for script scanning).
