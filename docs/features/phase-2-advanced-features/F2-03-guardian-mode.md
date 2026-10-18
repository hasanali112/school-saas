# F2-03 — Guardian Mode

| Field | Value |
|---|---|
| **Feature ID** | F2-03 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S23 |
| **Milestone(s)** | M4 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §7 Guardian app |
| **Status** | Not started |

## Summary

What a parent opens the app for: choose a child, see attendance, dues with pay-now, results and report card PDF, homework, routine and notices; apply for leave; message the class teacher; manage consent. No agent ever talks to a guardian directly except through content a human approved.

## Scope

### 1. Child selector
- Switch between linked children (F2-01 linking).

### 2. Views
- Today's attendance and monthly history.
- Dues with pay-now (payment itself via F2-05).
- Results and report card PDF download.
- Homework, routine, notices.

### 3. Actions
- Leave application for the child.
- Message the class teacher; messages route into the guardian inbox (F2-15).
- Consent management screen per purpose (F1-15).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S23 | 10–21 Oct 2027 | Guardian mode: child selector, attendance, dues, results and report card PDF, homework, routine, notices, leave application, message class teacher, consent screen; guardian inbox routing |

## Dependencies

- **Upstream (needs):** F2-01, F1-05, F1-06, F1-07, F1-10, F1-15.
- **Downstream (unblocks):** F2-05 pay-now, F2-13 WhatsApp replies into the same inbox, F3-04 guardian inbox drafting.

## Acceptance criteria

- [ ] A guardian sees only their own children's data.
- [ ] Report card PDF opens for a published exam and is unavailable for an unpublished one.
- [ ] A message to the class teacher lands in that teacher's inbox and nowhere else.
- [ ] Withdrawing SMS consent in the app removes the guardian from the next SMS audience.

## Out of scope / deferred

- Weekly digest (Spec v2 §7 mentions it as optional; not scheduled).
- Online payment flow (F2-05).

## Open questions

- Whether a guardian can see the other guardian's messages for the same child.
