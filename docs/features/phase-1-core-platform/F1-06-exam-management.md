# F1-06 — Exam Management

| Field | Value |
|---|---|
| **Feature ID** | F1-06 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S8, S9, S10, S11 |
| **Milestone(s)** | M2 (exam module complete, 6 May 2027), M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.4 Marks entry, §6.5 Status board, §6.6 Tabulation, §6.8 Publish, §6.9 Grading rules |
| **Status** | Not started |

## Summary

The module that wins or loses the sale: exam setup, a versioned grading-rules engine with NCTB presets, marks entry that survives 20 teachers at once, tabulation, GPA with the 4th-subject rule, publish with a 24-hour unpublish window, bilingual report cards and result SMS. Correctness is proven by reproducing three real tabulation sheets.

## Scope

### 1. Exam setup
- Exam types; setup per class and group.
- Subject components: CQ / MCQ / Practical with per-component full marks and pass marks.

### 2. Grading rules engine
- Versioned rules; NCTB 2026 and NCTB 2027 presets.
- A rule version is **locked once any result is published against it**.
- Reproduction tests against three real tabulation sheets (S8).

### 3. Marks entry
- Autosave; absent flag; submit and lock; reopen by exam controller; full audit.
- Excel import and export; blank mark-sheet print.
- Entry status board with manual reminders and deadline extension.

### 4. Result computation
- Grades, GPA, 4th-subject rule, merit position with tie rules.
- Tabulation sheet with frozen columns, A4 landscape.

### 5. Publish workflow
- Publish freezes marks and the rule version.
- 24-hour unpublish window with audit.
- Emits `result.published` event (triggers F3-03a result analysis and F3-03b remark writer).

### 6. Outputs
- Report cards in Bangla and English layouts; batch PDF.
- Result SMS, segment-optimised, with a publish → SMS review step.
- Website result lookup (F1-14).
- Previous-exam comparison.
- Admit cards and seat plans.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S8 | 14–25 Mar 2027 | Exam types and setup; subject components; versioned grading rules engine with NCTB 2026 and 2027 presets; result computation; reproduction tests against three real tabulation sheets |
| S9 | 28 Mar–8 Apr 2027 | Marks entry (autosave, absent, submit and lock, reopen, audit); blank mark-sheet print; Excel import and export; entry status board with manual reminders; deadline extension |
| S10 | 11–22 Apr 2027 | Tabulation sheet; publish workflow (freeze marks and rule version, 24-hour unpublish); report cards (Bangla and English, batch PDF); `result.published` event |
| S11 | 25 Apr–6 May 2027 | Result SMS; publish → SMS review; website result lookup; previous-exam comparison; admit cards; seat plans; exam print QA → **M2** |

## Dependencies

- **Upstream (needs):** F1-02 (subjects, groups, teacher assignments), F1-03 (students, rolls), F1-12 (SMS), F1-14 (result lookup page), F1-01 (audit).
- **Downstream (unblocks):** F1-13 result summary report, F2-02 offline marks entry, F2-03 guardian results, F3-03a/b/l agents, F3-04 result analytics and anomaly detection, F3-07 question paper studio.

## Acceptance criteria

- [ ] The engine reproduces three institution-supplied tabulation sheets exactly (grade, GPA, merit position).
- [ ] A published exam's rule version cannot be edited; a new version must be created.
- [ ] 20 teachers entering marks concurrently do not lose autosaved data (load test in S18).
- [ ] A locked sheet cannot be edited until the exam controller reopens it, and the reopen is audited.
- [ ] Unpublish is possible within 24 hours only, with reason, and is audited.
- [ ] Report card batch of 1,500 renders correct Bangla typography (S18 print QA).
- [ ] Result SMS shows recipient count, segment count and cost before sending.
- [ ] Admit cards and seat plans print per exam.

## Out of scope / deferred

- Question bank and question paper drafting (F3-07).
- Result analytics narrative and at-risk ranking (F3-03a, F3-04).
- Answer-script scanning (Spec v2 §6.11, Phase 4).

## Open questions

- Exact NCTB 2027 rule set (must be confirmed before S8; presets are versioned so a later correction is possible).
- Tie rule precedence for merit position (total marks → GPA → specific subjects?).
- Whether admit cards need photo and seal from F1-11 template engine, which ships later (S14).
