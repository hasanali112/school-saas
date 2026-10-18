# F3-05 — Ask-your-data Command Bar

| Field | Value |
|---|---|
| **Feature ID** | F3-05 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S42 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §4 Global shell |
| **Status** | Not started |

## Summary

A Bangla and English natural-language bar (Ctrl/⌘-K on web, long-press on mobile). Ask mode answers questions over a whitelisted semantic layer and always shows source rows. Do mode opens filtered pages or creates proposals. It never mutates data directly and every query is audited.

## Scope

### 1. Ask mode
- Natural-language question in Bangla or English → answer with source rows.
- Whitelisted semantic layer (entities and fields from F2-14's model); no free SQL.
- Respects the user's role and RLS.

### 2. Do mode
- Opens a filtered page ("show class 8 absentees today") or creates a proposal ("remind class 9 defaulters") routed to F3-02.
- **Never a direct mutation.**

### 3. Platforms and audit
- Web and mobile (F2-01).
- Every query, answer and action audited with cost.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S42 | 3–14 Sep 2028 | Ask-your-data command bar (Bangla/English; ask mode over a semantic layer with source rows; do mode to filtered pages or proposals); web and mobile; query audit |

## Dependencies

- **Upstream (needs):** F3-01 gateway, F3-02 proposals, F2-14 entity model, F2-01 mobile.
- **Downstream (unblocks):** F3-07 natural-language custom reports reuse the semantic layer.

## Acceptance criteria

- [ ] A Bangla question about today's collection returns the figure with a link to the receipts behind it.
- [ ] A subject teacher asking about fees receives a permission-scoped refusal, not data.
- [ ] A do-mode request that would send messages creates a proposal and nothing is sent until approved.
- [ ] Every query appears in the audit log with the user, cost and outcome.

## Out of scope / deferred

- Voice input (A-01 covers attendance only).

## Open questions

- Credit cost per query and whether ask mode is metered.
