# F3-07 — Creation Tools

| Field | Value |
|---|---|
| **Feature ID** | F3-07 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus (question paper studio, NL reports); EduPro (workflow builder, committee report) |
| **Sprints** | S47, S48, S49 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.10 Question paper studio, §6.21 Workflow builder, §6.27 Custom report builder |
| **Status** | Not started |

## Summary

Tools that create documents and automations rather than analyse data: a question paper studio, a no-code workflow builder that turns a sentence into a guarded workflow, natural-language custom reports, and committee monthly report drafting.

## Scope

### 1. Question paper studio
- Question bank; NCTB marks-distribution presets.
- Drafting from the bank (F3-03l agent); coverage and duplication checks; Bangla proofreading.
- Answer key and rubric.
- Lock and seal; DOCX and PDF export.

### 2. Workflow builder
- Guarded blocks (read, propose, wait for approval, notify); no code.
- Sentence → workflow: describe in Bangla or English, get an editable workflow.
- Every workflow's proposals still pass through F3-02.

### 3. Natural-language custom reports
- Describe a report; the system produces an F2-14 builder definition the user can edit and save.

### 4. Committee monthly report drafting
- Draft the head's report for F2-12 from the monthly summary; head edits and publishes.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S47 | 12–23 Nov 2028 | Natural-language report builder; committee monthly report drafting |
| S48 | 26 Nov–7 Dec 2028 | Question paper studio I: question bank, NCTB distribution presets, drafting from bank, coverage and duplication checks, Bangla proofreading, answer key and rubric |
| S49 | 10–21 Dec 2028 | Question paper studio II: lock and seal, DOCX/PDF export; workflow builder (guarded blocks, sentence to workflow) |

## Dependencies

- **Upstream (needs):** F3-01, F3-02, F3-03l, F2-14, F2-12, F1-06 (subjects, exam types), F3-05 semantic layer.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] A drafted paper matches the chosen NCTB distribution and flags any question duplicated from the last two papers.
- [ ] A locked and sealed paper cannot be edited; export produces DOCX and PDF with correct Bangla rendering.
- [ ] A workflow built from a sentence contains only guarded blocks and cannot include a direct write.
- [ ] A natural-language report request produces a saved custom report a user can open in the builder.

## Out of scope / deferred

- Answer-script scanning and marking assist (Spec v2 §6.11, Phase 4).

## Open questions

- Question bank seeding: institution-authored only, or a shared platform bank.
- Who can seal a paper (Exam Controller vs Head).
