# F1-10 — Academics

| Field | Value |
|---|---|
| **Feature ID** | F1-10 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S7 (Office Today v1), S13 |
| **Milestone(s)** | M1 (Office Today), M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.1 Head's today, §6.2 Teacher's today |
| **Status** | Not started |

## Summary

Day-to-day teaching artefacts: homework per class-subject, assignments with submission tracking, targeted notices and a materials library, plus the two "Today" landing pages (Office Today for admin staff, Teacher Today for teachers) that become the entry points for the whole product.

## Scope

### 1. Homework
- Per class-subject with attachments; visible to guardians in F2-03.

### 2. Assignments
- Assignment with due date; submission tracking per student.

### 3. Notices
- Targeted notices (by role, class, section, individual).

### 4. Materials library (Document Management)
- Upload and organise teaching materials per class-subject; consumed by A-03 study helper.

### 5. Today pages v1
- **Office Today**: the admin officer's daily view (delivered with M1 build).
- **Teacher Today**: today's periods, pending attendance and marks, homework to set.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S7 | 20–31 Dec 2026 | Office Today v1 |
| S13 | 23 May–3 Jun 2027 | Homework; assignments with submissions; targeted notices; materials library; Teacher Today v1 |

## Dependencies

- **Upstream (needs):** F1-02, F1-03, F1-09 routine (for Teacher Today periods).
- **Downstream (unblocks):** F2-02 teacher mode homework/assignments, F2-03 guardian homework/notices, F3-04 Head's Today with ranked decisions, F3-04 homework drafts from lesson plan.

## Acceptance criteria

- [ ] A subject teacher can set homework with an attachment for an assigned section only.
- [ ] Assignment submissions can be marked received per student and the count is visible.
- [ ] A notice targeted to one section is not visible to other sections.
- [ ] Teacher Today lists today's periods from the routine with attendance status per period.

## Out of scope / deferred

- Head's Today with ranked decision list (F3-04).
- Agent-drafted homework (F3-04).
- Attachment compression for mobile (F2-02).

## Open questions

- Storage quota per institution for attachments and materials.
- Whether "Office Today" is a distinct route from Head's Today in Spec v2 §6.1 or the same page with a role-based layout.
