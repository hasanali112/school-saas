# F2-05 — Online Fee Collection

| Field | Value |
|---|---|
| **Feature ID** | F2-05 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S24 |
| **Milestone(s)** | M4 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.12, §6.13 Counter close |
| **Status** | Not started |

## Summary

SSLCommerz integration so guardians can pay dues from the app or website via bKash, Nagad, Rocket or cards, with IPN validation, automatic receipts, an online payment log, settlement reconciliation, per-institution merchant credentials, and payment links sent by SMS from the counter.

## Scope

### 1. Gateway
- SSLCommerz covering bKash, Nagad, Rocket and cards.
- Per-institution merchant credentials (managed via F2-07).
- IPN validation with signature check before crediting.

### 2. Pay-now
- From guardian mode (F2-03) and the website (F1-14).
- Payment link by SMS generated from the counter.

### 3. Records
- Automatic receipt with gapless number (F1-07 sequence).
- Online payment log; settlement reconciliation against gateway settlement reports.
- Automatic posting to accounts (F1-08).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S24 | 24 Oct–4 Nov 2027 | SSLCommerz (bKash, Nagad, Rocket, cards) from app and website; IPN validation; automatic receipts; online payment log; settlement reconciliation; per-institution merchant credentials; payment link by SMS from the counter |

## Dependencies

- **Upstream (needs):** F1-07, F1-08, F1-12, F1-14, F2-03.
- **Downstream (unblocks):** F2-16 counter close gateway matching, F3-03h collection reconciliation agent.

## Acceptance criteria

- [ ] A forged IPN without a valid signature does not credit a payment.
- [ ] A successful payment produces a receipt in the same gapless sequence as counter receipts and posts to accounts.
- [ ] Settlement report import flags any payment not settled.
- [ ] Payment link SMS opens a checkout for exactly the selected invoice.

## Out of scope / deferred

- Direct bKash/Nagad merchant APIs outside SSLCommerz.

## Open questions

- Who bears gateway fees (institution vs guardian surcharge) and whether it is configurable.
