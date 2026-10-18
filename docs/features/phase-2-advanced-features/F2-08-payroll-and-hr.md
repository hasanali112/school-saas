# F2-08 — Payroll & HR

| Field | Value |
|---|---|
| **Feature ID** | F2-08 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S15 (staff records basics, Phase 1), S27 |
| **Milestone(s)** | M5 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §2 (HR Officer role) |
| **Status** | Not started |

## Summary

Salary structures that split MPO (government) and institution portions, allowances and deductions, a provident fund ledger, a monthly payroll run that posts automatically to accounts, payslip PDFs, and a service record with joining, increments and promotions linked to leave balances.

## Scope

### 1. Staff records
- Service basics and MPO index (delivered in S15, Phase 1).
- Service record: joining, increments, promotions.

### 2. Salary structure
- MPO and institution split; allowances and deductions.
- Provident fund ledger.

### 3. Payroll run
- Monthly run; automatic posting to F1-08 accounts.
- Payslip PDF on letterhead.
- Leave-balance link to F1-05 leave.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S15 | 20 Jun–1 Jul 2027 | Staff records (service basics, MPO index) |
| S27 | 5–16 Dec 2027 | Salary structure with MPO split, allowances and deductions, provident fund ledger, monthly payroll run with auto-posting, payslips, service record, leave-balance link |

## Dependencies

- **Upstream (needs):** F1-02 users/staff, F1-05 leave, F1-08 accounts, F1-11 PDF pipeline.
- **Downstream (unblocks):** F2-11 MPO staff statement, F2-12 committee summary.

## Acceptance criteria

- [ ] A payroll run for a month produces one balanced posting to accounts and one payslip per staff member.
- [ ] MPO and institution portions are shown separately on the payslip.
- [ ] Unpaid leave in F1-05 reduces the month's salary per the configured rule.
- [ ] A run cannot be executed twice for the same month without a reversal.

## Out of scope / deferred

- Tax computation and government e-filing.

## Open questions

- Provident fund rules (contribution rates, interest) per institution type.
