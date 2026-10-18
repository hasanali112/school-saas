# F2-15 — Admissions CRM & Student 360

| Field | Value |
|---|---|
| **Feature ID** | F2-15 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S23 (guardian inbox routing), S34 |
| **Milestone(s)** | M6 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.15 Student 360 timeline, §6.16 Admissions CRM |
| **Status** | Not started |

## Summary

Three related pieces: an enquiry pipeline in front of the Phase 1 admission form (enquiry → form → test → selected → admitted) with sources, follow-ups, conversion and seat availability; a Student 360 timeline assembled from the event log; and a guardian inbox routed to class teachers.

## Scope

### 1. Admissions CRM
- Enquiry pipeline stages; sources; follow-up tasks; conversion by source; seat availability per class.
- Flows into F1-04 at the form stage.

### 2. Student 360 timeline
- Chronological view of every event about a student (attendance, marks, payments, messages, documents) built from the F1-16 event log.

### 3. Guardian inbox
- Messages from app (F2-03) and WhatsApp (F2-13) routed to the child's class teacher; escalation to head.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S23 | 10–21 Oct 2027 | Guardian inbox routing |
| S34 | 14–25 May 2028 | Admissions CRM (enquiry pipeline, sources, follow-ups, conversion, seat availability); Student 360 timeline from events |

## Dependencies

- **Upstream (needs):** F1-04, F1-16 event log, F2-03.
- **Downstream (unblocks):** F3-04 Student 360 summary and guardian inbox drafting, F3-03f dropout risk, A-04 admissions FAQ bot.

## Acceptance criteria

- [ ] Conversion by source shows enquiries → admitted per source for a session.
- [ ] Seat availability decrements as applicants are admitted.
- [ ] Student 360 shows a fee payment, an absence and a message on the same timeline with source links.
- [ ] A guardian message reaches the current class teacher even after a section change.

## Out of scope / deferred

- AI summary of the timeline (F3-04).

## Open questions

- Retention of timeline events under PDPA deletion (see F1-16 open question).
