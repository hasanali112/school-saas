# F1-07 — Fees & Billing

| Field | Value |
|---|---|
| **Feature ID** | F1-07 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S5, S6 |
| **Milestone(s)** | M1 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.12 Fee collection counter, §6.14 Due list |
| **Status** | Not started |

## Summary

The cashier's counter, digitised: fee structures per class/group/session, monthly invoices, a collection counter with gapless receipt numbering and thermal/A5 printing, partial payments, waivers with approval, and a dues engine with ageing and reminder SMS. Every rupee posts automatically into accounts (F1-08).

## Scope

### 1. Fee configuration
- Fee heads; fee structure per class, group and session.
- Monthly invoice generation.

### 2. Collection counter
- **Gapless receipt numbering** per institution.
- Receipt print for 80 mm thermal and A5.
- Partial payments.
- Payment modes: cash, bKash TrxID (manual reference), bank slip.
- Waivers with approval workflow.
- Void with reason (audited).

### 3. Student ledger
- Per-student ledger of invoices, payments, waivers and voids.

### 4. Dues
- Dues engine with ageing buckets.
- Due list with reminder SMS (F1-12).

### 5. Reports
- Collection reports: daily, head-wise, class-wise.
- Cashbook (shared with F1-08).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S5 | 22 Nov–3 Dec 2026 | Fee heads and structure; invoices; collection counter; gapless receipts (thermal and A5); partial payments; cash, bKash TrxID and bank-slip modes; waivers with approval; void with reason; student ledger |
| S6 | 6–17 Dec 2026 | Dues engine and ageing; due list with reminder SMS; collection reports; cashbook |

## Dependencies

- **Upstream (needs):** F1-02 (class/group/session), F1-03 (students), F1-12 (reminder SMS), F1-01 (audit of money).
- **Downstream (unblocks):** F1-08 automatic posting, F1-11 transfer certificate dues-clearance check, F1-13 collection and dues reports, F2-05 online fee collection, F2-03 guardian dues and pay-now, F2-16 counter close, F3-03c fee reminder agent, F3-03h collection reconciliation agent.

## Acceptance criteria

- [ ] Receipt numbers are sequential with no gaps, including after a void (void keeps the number, marks it void).
- [ ] A partial payment leaves the correct balance on the invoice and the student ledger.
- [ ] A waiver cannot apply until approved by an authorised role, and the approval is audited.
- [ ] Thermal and A5 receipts print correctly in Bangla on a real printer (S18 print QA).
- [ ] Dues ageing shows outstanding balances by age bucket per student and per class.
- [ ] Due-list reminder SMS previews recipient count and cost before sending.
- [ ] Daily collection report totals reconcile with the cashbook for the same day.

## Out of scope / deferred

- Online gateway payments and IPN (F2-05).
- Counter close and reconciliation against gateway and bank (F2-16).
- Fee-head links for transport and hostel (F2-10).

## Open questions

- Whether the counter must work offline (Spec v2 §8 says counter collection works without connectivity; not listed in the sprint plan for Phase 1).
- Reversal rule for a voided receipt already posted into accounts.
