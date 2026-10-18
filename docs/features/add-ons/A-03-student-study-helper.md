# A-03 — Student Study Helper (Add-on)

| Field | Value |
|---|---|
| **Feature ID** | A-03 |
| **Phase** | Optional add-on (quoted separately) |
| **Tier availability** | Add-on; requires a student login surface |
| **Sprints** | S51 |
| **Milestone(s)** | — (post-M8) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §7 Student app ("bounded study helper") |
| **Status** | Not started (optional) |

## Summary

A bounded helper for students that explains topics from the syllabus and the institution's own materials (F1-10 library), refuses to do assignments, and reports aggregate usage to the class teacher. Bounded means it will not answer outside the syllabus and materials.

## Scope

- Retrieval limited to syllabus and institution materials; refusal outside scope.
- Assignment-detection rule: refuses to produce submittable answers.
- Aggregate usage (topics, counts) to the class teacher; no per-student transcripts to staff.
- Requires student login (student mode of F2-01 or web), which is not otherwise scheduled.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S51 | 18–29 Mar 2029 | Student study helper (bounded) |

## Dependencies

- **Upstream (needs):** F3-01, F1-10 materials, F1-15 consent (AI processing for minors), a student login surface.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] A question outside the syllabus receives a refusal that names the boundary.
- [ ] An assignment prompt is refused; a concept question is explained.
- [ ] Class teacher sees topic-level usage without individual conversations.

## Out of scope / deferred

- Student mobile mode as a whole (not in the sprint plan).

## Open questions

- Guardian consent flow for a minor's AI processing.
- Whether a student mode must be built first (a scope risk for one sprint).
