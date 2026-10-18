# F3-03h — Collection Reconciliation Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03h |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S44 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

At every counter close the agent explains each discrepancy in the reconciliation (likely cause, matching receipt or slip) and watches for shortage patterns across days and cashiers, alerting the head. Read-only.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | Counter close (F2-16 `counter.closed`) |
| **Reads** | Receipts, online payments, bank slips |
| **Proposes** | Discrepancy list with explanations; shortage-pattern alerts |
| **Default policy** | Auto (read-only) |

## Scope

- Trigger on counter close; reads F2-16 discrepancy list, F1-07 receipts, F2-05 online log, bank slips.
- Per-discrepancy explanation with candidate matches.
- Shortage-pattern detection across closes; alert to head with the pattern and source rows.
- Feeds the morning brief (F3-03e).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S44 | 1–12 Oct 2028 | Collection reconciliation explanation and shortage-pattern alerts |

## Dependencies

- **Upstream (needs):** F3-01, F2-16 counter close, F1-07, F2-05, F1-08.
- **Downstream (unblocks):** F3-03e brief content.

## Acceptance criteria

- [ ] Every discrepancy on the close page has an explanation or an explicit "unexplained" state.
- [ ] A repeated shortage on the same cashier over the configured window raises an alert.
- [ ] No reconciliation entry is auto-adjusted.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Alert thresholds and whether alerts also go to the committee portal.

