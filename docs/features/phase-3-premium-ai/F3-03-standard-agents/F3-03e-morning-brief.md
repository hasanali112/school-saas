# F3-03e — Morning Brief Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03e |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPro |
| **Sprints** | S41 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Before the head reaches school, a three-sentence Bangla brief summarises yesterday and ranks today's decisions (approvals waiting, flags, shortages). Shown on Head's Today, the brief page and head mode. Read-only, so it runs without approval.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | 06:30 daily |
| **Reads** | Yesterday's attendance, collection, approvals, flags |
| **Proposes** | A three-sentence Bangla brief per head; ranked decision list |
| **Default policy** | Auto (read-only) |

## Scope

- Inputs: yesterday's attendance, collection vs target, pending approvals (F3-02), flags from F3-03d and F3-03h.
- Output: three sentences plus a ranked decision list with one-tap actions that open the relevant queue or page.
- Delivered as push to head mode (F2-04) and rendered on Head's Today (F3-04).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S41 | 20–31 Aug 2028 | Morning brief agent; Head's Today with ranked decision list; brief page and head-mode brief |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F1-05, F1-07, F2-04, F3-03d, F3-03h.
- **Downstream (unblocks):** F3-04 Head's Today.

## Acceptance criteria

- [ ] The brief is available by 06:35 every school day and is skipped on holidays.
- [ ] Each decision item opens the page or approval it refers to.
- [ ] Every figure links to its source rows.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Whether Admin Officers on EduPlus get a reduced brief (business plan lists the brief as EduPro).

