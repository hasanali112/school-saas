# F2-13 — WhatsApp Channel

| Field | Value |
|---|---|
| **Feature ID** | F2-13 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPro only |
| **Sprints** | S32 |
| **Milestone(s)** | M6 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.18 Communication |
| **Status** | Not started |

## Summary

WhatsApp Business API through a Business Solution Provider (BSP): template management with approval status, media messages (report cards, notices), opt-in tracking, replies routed into the guardian inbox, and cost preview. The composer and inbox are unified with SMS.

## Scope

### 1. BSP integration
- Template submission and approval-status tracking.
- Media messages (report card PDF, notice image).
- Opt-in tracking as a consent purpose (F1-15).

### 2. Composer and inbox
- Same composer as SMS (F1-12) with channel choice and cost preview.
- Inbound replies land in the guardian inbox (F2-15) alongside app messages.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S32 | 16–27 Apr 2028 | WhatsApp Business channel via BSP: templates and approval status, media messages, opt-in tracking, replies into guardian inbox, cost preview; composer and inbox unification |

## Dependencies

- **Upstream (needs):** F1-12, F1-15, F2-07, F2-15 guardian inbox.
- **Downstream (unblocks):** F3-04 guardian inbox drafting covers WhatsApp replies.

## Acceptance criteria

- [ ] A message cannot be sent with a template that is not yet approved by the BSP.
- [ ] Guardians without WhatsApp opt-in are excluded and the cost preview reflects that.
- [ ] A report card sent as media opens on the guardian's phone.
- [ ] A guardian's reply appears in the class teacher's inbox within a minute.

## Out of scope / deferred

- WhatsApp as a login or OTP channel.

## Open questions

- BSP selection and per-conversation pricing.
