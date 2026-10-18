# F1-08 — Accounts

| Field | Value |
|---|---|
| **Feature ID** | F1-08 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S12 |
| **Milestone(s)** | M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §2 (Accountant role) |
| **Status** | Not started |

## Summary

A school-oriented double-entry ledger: chart of accounts, receipt/payment/journal vouchers, automatic posting of fee collections, the standard books (ledger, cashbook, bank book), an income–expenditure statement, trial balance, budget vs actual and a period lock. Built for the accounts officer and the governing body, not for a chartered accountant.

## Scope

### 1. Chart of accounts
- School-oriented default chart (tuition, admission, exam fees, MPO salary, development fund, etc.) editable per institution.

### 2. Vouchers
- Receipt, payment and journal vouchers with attachments and approval.
- Automatic posting of fee collections from F1-07 (and later payroll from F2-08, online payments from F2-05).

### 3. Books and statements
- Ledger, cashbook, bank book.
- Income–expenditure statement.
- Trial balance.
- Budget vs actual.

### 4. Controls
- Period lock: no postings into a closed period; reopening audited.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S12 | 9–20 May 2027 | Chart of accounts; receipt, payment and journal vouchers; automatic posting of fees; ledger, cashbook, bank book; income–expenditure statement; trial balance; budget vs actual; period lock |

## Dependencies

- **Upstream (needs):** F1-07 (fee collections to post), F1-01 (audit of money).
- **Downstream (unblocks):** F2-08 payroll auto-posting, F2-05 online payment posting, F2-12 committee monthly summary, F2-11 statutory financial figures, F3-03h collection reconciliation.

## Acceptance criteria

- [ ] Every fee receipt in F1-07 produces a balanced posting without manual entry.
- [ ] Trial balance balances after a month of mixed vouchers and fee postings.
- [ ] A voucher dated inside a locked period is rejected with a clear message.
- [ ] Income–expenditure statement and budget vs actual export to PDF on letterhead.

## Out of scope / deferred

- Payroll postings (F2-08).
- Bank reconciliation against statements (partially in F2-16 counter close).

## Open questions

- Fiscal year convention (calendar year vs July–June) and whether it differs from the academic session.
- Whether voucher approval is required or optional per institution.
