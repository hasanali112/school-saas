# F2-07 — Integrations Hub

| Field | Value |
|---|---|
| **Feature ID** | F2-07 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro (WhatsApp card: EduPro) |
| **Sprints** | S25 (v1), S32 (WhatsApp card) |
| **Milestone(s)** | M4 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.24 Integrations hub |
| **Status** | Not started |

## Summary

One page where an institution connects, tests and rotates keys for every external service: primary and secondary SMS gateways, the payment gateway, biometric devices and WhatsApp. Each card shows connection status and last sync.

## Scope

### 1. Cards
- SMS gateway primary and secondary (F1-12).
- Payment gateway merchant credentials (F2-05).
- Biometric devices (F2-06).
- WhatsApp BSP (F2-13).

### 2. Card actions
- Connect, test, rotate keys, view last sync / last error.
- Secrets stored encrypted; never displayed after entry.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S25 | 7–18 Nov 2027 | Integrations hub v1 (SMS, payment, biometric cards) |
| S32 | 16–27 Apr 2028 | WhatsApp card |

## Dependencies

- **Upstream (needs):** F1-12, F2-05, F2-06, F2-13.
- **Downstream (unblocks):** F3-01 model gateway configuration could reuse the pattern.

## Acceptance criteria

- [ ] "Test" on the SMS card sends a test message and shows gateway response.
- [ ] Rotating a payment key invalidates the old one and is audited.
- [ ] A biometric device card shows last sync time consistent with the device health page.

## Out of scope / deferred

- Generic webhook/API key management for third parties.

## Open questions

- Whether platform admin can manage credentials on behalf of a tenant.
