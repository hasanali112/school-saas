# F1-04 — Admission

| Field | Value |
|---|---|
| **Feature ID** | F1-04 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S6 (admission lite), S16 (full) |
| **Milestone(s)** | M1 (admission lite), M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.16 Admissions CRM (Phase 2 successor) |
| **Status** | Not started |

## Summary

The annual intake flow: a public application form on the institution website, a pipeline of applications, admission test marks, merit list generation and publishing, and finally roll/section allocation that turns an applicant into a student record. An "admission lite" cut ships for M1 so pilots can enrol for the January 2027 session.

## Scope

### 1. Public admission form
- Hosted on the institution website (F1-14), Bangla and English.
- Captures applicant, guardian (phone) and class applied for.

### 2. Applications pipeline
- Statuses from received through selected / rejected.
- Admission lite (S6): applications entry and roll/section allocation only.

### 3. Admission test marks
- Enter test marks per applicant.

### 4. Merit list
- Generate a ranked list per class from test marks.
- Publish the merit list (to the website via F1-14).

### 5. Allocation
- Roll and section allocation that **creates the student record** (F1-03).

### 6. Notification
- SMS to selected applicants using F1-12.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S6 | 6–17 Dec 2026 | Admission applications and roll/section allocation (admission lite) |
| S16 | 4–15 Jul 2027 | Public form on website, application pipeline, admission test marks, merit list and publishing, SMS to selected |

## Dependencies

- **Upstream (needs):** F1-03 students, F1-12 SMS, F1-14 website.
- **Downstream (unblocks):** F2-15 admissions CRM (enquiry stage before the form), A-04 admissions FAQ bot.

## Acceptance criteria

- [ ] A guardian can submit the public form without an account and receives a reference number.
- [ ] Admin can move an application through the pipeline and record a test mark.
- [ ] Merit list orders applicants by test mark with a defined tie rule and can be published to the website.
- [ ] Allocating roll and section creates a student record with the applicant's data and no re-typing.
- [ ] Selected applicants receive an SMS whose cost was previewed before sending.

## Out of scope / deferred

- Enquiry pipeline, sources, follow-ups and seat availability (F2-15).
- Online admission fee payment (F2-05).

## Open questions

- Tie rule for the merit list (age? earlier application?).
- Whether the public form needs OTP verification of the guardian phone to limit spam.
