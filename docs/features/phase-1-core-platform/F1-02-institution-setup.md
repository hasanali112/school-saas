# F1-02 — Institution Setup

| Field | Value |
|---|---|
| **Feature ID** | F1-02 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S0 (i18n), S1, S3 (holiday calendar) |
| **Milestone(s)** | M1 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §2 Roles and principals, §4 Global shell |
| **Status** | Not started |

## Summary

Everything an institution configures once per session before day-to-day work starts: identity (profile, EIIN, letterhead, seal, signatures), academic structure (sessions, shifts, classes, sections, groups, subjects), staffing assignments, users and permissions, and the holiday calendar. All of it is bilingual Bangla/English.

## Scope

### 1. Institution profile
- Name and address in Bangla and English.
- EIIN, logo, letterhead, seal, and signature images used by every printed document (F1-11, F1-06 report cards).

### 2. Academic structure
- Sessions (academic years) with rollover support (rollover wizard itself is F1-03).
- Shifts with period timings (consumed by F1-09 class routine).
- Classes, sections, groups (Science / Arts / Commerce).
- Subjects, including the **4th subject** and **religion variants** (Islam / Hindu / Buddhist / Christian studies).

### 3. Teacher–subject–section assignment
- Assign teachers to subjects within sections.
- Basis for "assigned classes only" attendance rule (F1-05) and marks-entry scope (F1-06).

### 4. Users, roles and permissions
- Roles exactly per Spec v2 §2: Platform Admin, Institute Head, Admin Officer, Accountant, Exam Controller, Class Teacher, Subject Teacher, Librarian/Store/Transport/Hostel, HR Officer, Data Protection Contact, Student, Guardian, Committee Member, Agent.
- Permission check order: RLS at the database, then role, then assignment.

### 5. Calendar
- Government holidays and institution holidays.
- Consumed by attendance (F1-05), routine (F1-09), and agent schedules in Phase 3.

### 6. Language
- Per-user Bangla/English toggle; i18n framework and Bangla-capable design system delivered in S0.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S0 | 13–24 Sep 2026 | Bangla/English i18n; design system with Bangla fonts; application shell |
| S1 | 27 Sep–8 Oct 2026 | Institution profile; sessions, shifts, classes, sections, groups, subjects; teacher assignments; users, roles, permissions; RLS test suite |
| S3 | 25 Oct–5 Nov 2026 | Holiday calendar |

## Dependencies

- **Upstream (needs):** F1-01 (tenancy, auth).
- **Downstream (unblocks):** F1-03 students (session, class, section), F1-05 attendance (assignments, calendar), F1-06 exams (subjects, groups), F1-07 fees (class/group structure), F1-09 routine (shift timings), F1-11 documents (letterhead, seal, signatures).

## Acceptance criteria

- [ ] Profile fields render in both languages and appear on a printed letterhead sample.
- [ ] A class can have multiple sections, a section belongs to a shift, and a group can be attached at class level.
- [ ] 4th subject and religion-variant subjects can be assigned per student class without duplication of the core subject list.
- [ ] Each Spec v2 role exists, and a user with only Subject Teacher role cannot see sections they are not assigned to.
- [ ] Holiday calendar shows government and institution holidays separately and blocks attendance entry on those dates.
- [ ] Switching the per-user language changes every UI label without reload errors.

## Out of scope / deferred

- Staff records beyond login users (service basics and MPO index arrive in S15 under F2-08 groundwork).
- Tier configuration UI (F1-17).

## Open questions

- Whether sections can be re-shuffled mid-session and how that interacts with per-session roll (F1-03).
- Source of the government holiday list (manual entry vs a maintained platform-level list pushed to tenants).
