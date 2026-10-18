# F3-03l — Question Paper Drafter Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03l |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S48–S49 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Given an exam, class, subject and NCTB marks distribution, the agent drafts a paper from the question bank, reports syllabus coverage and duplication against past papers, proofreads Bangla, and produces an answer key and rubric. The teacher edits and the Exam Controller locks and seals in the studio (F3-07).

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | Manual (question paper studio, F3-07) |
| **Reads** | Syllabus, question bank, past papers |
| **Proposes** | Draft paper by marks distribution with coverage and duplication report |
| **Default policy** | Always |

## Scope

- Inputs: syllabus tags, question bank, past papers, distribution preset.
- Outputs: draft paper, coverage report, duplication report, proofreading suggestions, answer key, rubric.
- Never generates outside the bank unless explicitly asked; generated questions are marked as such.
- Lock, seal and export handled by F3-07.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S48–S49 | 26 Nov–21 Dec 2028 | Drafting from bank, coverage and duplication checks, Bangla proofreading, answer key and rubric (S48); lock and seal, export (S49) |

## Dependencies

- **Upstream (needs):** F3-01, F3-07 question bank, F1-06 subjects and exam types.
- **Downstream (unblocks):** F3-07 studio.

## Acceptance criteria

- [ ] Draft matches the chosen distribution exactly by marks and question type.
- [ ] Any question reused from the last two papers is flagged.
- [ ] Answer key and rubric correspond to the final edited paper.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Whether the agent may generate new questions or only select from the bank.

