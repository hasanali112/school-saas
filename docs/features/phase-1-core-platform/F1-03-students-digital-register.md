# F1-03 — Students (Digital Register)

| Field | Value |
|---|---|
| **Feature ID** | F1-03 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S2, S14 |
| **Milestone(s)** | M1 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.15 Student profile, §9 Conventions |
| **Status** | Not started |

## Summary

The digital replacement for the paper admission register. Holds every student's bilingual identity, per-session enrolment, guardians and lifecycle, and gets the data in via Excel bulk import with a dry run. Session rollover, promotion and exit close the loop at year end.

## Scope

### 1. Student record
- Bangla and English names; admission number; per-session roll and section.
- Identity documents, blood group, religion, address, photo.
- Lifecycle states (e.g. applied, active, promoted, transferred, exited — exact list to be confirmed).

### 2. Guardians
- Guardian records keyed by phone number (phone is the identity used later for guardian app linking in F2-01 and consent in F1-15).
- One guardian may be linked to multiple students.

### 3. Search
- Bangla-aware search across names and admission/roll numbers.

### 4. Excel bulk import ("Primary Data Entry")
- Bangla import templates (templates themselves shipped in F1-17).
- Dry run that validates without writing.
- Downloadable error file listing failing rows and reasons.

### 5. List conventions (Spec v2 §9)
- Filters, saved views, column chooser, export, print, bulk-action bar on the students list; this becomes the pattern for every list in the product.

### 6. Year-end operations
- Promotion wizard: move students to the next class with new roll and section.
- Session rollover.
- Student exit with reason.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S2 | 11–22 Oct 2026 | Student records (Bangla/English), guardians, photos, lifecycle, Bangla search; Excel bulk import with dry run and error file; students list conventions |
| S14 | 6–17 Jun 2027 | Promotion wizard and session rollover; student exit |

## Dependencies

- **Upstream (needs):** F1-02 (sessions, classes, sections, groups).
- **Downstream (unblocks):** F1-04 admission (creates the record), F1-05 attendance, F1-06 exams, F1-07 fees, F1-11 ID cards and certificates, F1-15 consent (per guardian), F2-15 Student 360, F3-06 migration studio.

## Acceptance criteria

- [ ] A student can be created with Bangla and English names and a unique admission number per institution.
- [ ] Roll and section are stored per session, so history is retained across years.
- [ ] Searching a Bangla name fragment returns matching students.
- [ ] Import dry run on a 500-row sheet reports every error without creating any record; the error file opens in Excel.
- [ ] Students list supports filters, saved views, column chooser, export, print and bulk actions.
- [ ] Promotion wizard moves a whole class forward and assigns new rolls without losing prior-session roll.
- [ ] An exited student is excluded from active counts and billing (F1-01 metering).

## Out of scope / deferred

- Student mobile app / student login (not scheduled in these phases; Spec v2 §7 describes it).
- OCR of paper registers (F3-06 migration studio, A-02 scan add-on).
- Student 360 timeline (F2-15).

## Open questions

- Canonical lifecycle state list and which transitions are audited.
- Duplicate-detection rule on import (admission number only, or name + guardian phone too).
- Photo size limits and storage location given in-country data requirements.
