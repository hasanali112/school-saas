# F1-11 — Documents & Certificates

| Field | Value |
|---|---|
| **Feature ID** | F1-11 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro |
| **Sprints** | S0 (Bangla PDF pipeline), S6 (ID cards), S14 |
| **Milestone(s)** | M1 (ID cards), M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §8 Bangla output |
| **Status** | Not started |

## Summary

A template engine that produces every official paper a school issues: ID cards, testimonials, transfer certificates (with a dues-clearance check), character certificates, all on letterhead with seal and signatures, in Bangla or English, tracked in numbered registers with reprint and cancel.

## Scope

### 1. Bangla PDF pipeline (S0)
- Headless-Chromium PDF rendering with embedded Bangla fonts (Spec v2 §8).

### 2. Template engine
- Bangla and English templates; letterhead, seal and signatures from F1-02; merge fields from student, guardian, session and exam data.

### 3. Document types
- ID cards (CR80, batch PDF) — shipped early in S6 for the M1 pilot.
- Testimonials.
- Transfer certificates with **dues-clearance check** against F1-07.
- Character certificates.

### 4. Registers and control
- Numbered registers per document type.
- Reprint and cancel with reason (audited).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S0 | 13–24 Sep 2026 | Bangla PDF print pipeline |
| S6 | 6–17 Dec 2026 | ID card generator (batch PDF) |
| S14 | 6–17 Jun 2027 | Document template engine; testimonials; transfer certificates with dues-clearance check; character certificates; numbered registers; reprint and cancel |

## Dependencies

- **Upstream (needs):** F1-02 (letterhead, seal, signatures), F1-03 (student data, photos), F1-07 (dues check).
- **Downstream (unblocks):** F2-14 document template editor with merge-field picker, F1-06 report card layouts share the pipeline.

## Acceptance criteria

- [ ] A batch of ID cards for a whole section renders as one PDF with correct CR80 dimensions and Bangla names.
- [ ] A transfer certificate is blocked (with the outstanding amount shown) when the student has unpaid dues.
- [ ] Each issued certificate gets a sequential register number; cancelling records a reason and keeps the number.
- [ ] Reprint produces an identical document marked as reprint.

## Out of scope / deferred

- Visual template editor (F2-14).
- Custom report letterhead printing (F1-13 uses the same pipeline).

## Open questions

- Whether the dues-clearance check can be overridden by the head with a reason.
- Signature handling: image only, or also a digital signature/QR verification on certificates.
