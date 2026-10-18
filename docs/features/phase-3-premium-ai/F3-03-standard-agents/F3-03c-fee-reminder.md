# F3-03c — Fee Reminder Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03c |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S40 |
| **Milestone(s)** | M7 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Every morning the agent segments defaulters by ageing and payment history, drafts a reminder SMS batch with an appropriate tone per segment, and applies caps so no guardian is over-messaged. Nothing is sent until the accountant or head approves the batch.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | 10:00 daily |
| **Reads** | Dues, payment history |
| **Proposes** | Draft SMS batch, segmented by dues age and history, with tone and caps |
| **Default policy** | Always |

## Scope

- Segments: e.g. first reminder, repeat defaulter, partial payer, long-overdue; segments also shown on the due list (F3-04).
- Tone per segment from the Bangla prompt template; merge fields from F1-07.
- Caps: per-run and per-recipient limits (F3-02); consent-aware audience (F1-15).
- Cost preview in the proposal; on approval the service sends via F1-12 and, where the guardian has the app, push with SMS fallback (F2-01).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S40 | 6–17 Aug 2028 | Fee reminder agent (segments, tone, caps) |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F1-07 dues engine, F1-12, F1-15.
- **Downstream (unblocks):** due-list segments in F3-04.

## Acceptance criteria

- [ ] The daily batch appears in the approval queue by 10:05 with segment counts and total cost.
- [ ] A guardian reminded within the cap window is excluded from the next batch.
- [ ] Guardians without SMS consent never appear in the batch.
- [ ] Approving the batch sends messages and the delivery log shows them as agent-originated, human-approved.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Default cap values (per week per guardian) and whether tenants may tighten but not loosen them.

