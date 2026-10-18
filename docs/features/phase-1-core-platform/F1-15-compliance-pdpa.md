# F1-15 — Compliance (PDPA 2026)

| Field | Value |
|---|---|
| **Feature ID** | F1-15 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | All tiers (legal requirement) |
| **Sprints** | S7 (consent capture), S16 (subject rights) |
| **Milestone(s)** | M1 (consent), M3 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.23 Consent & privacy centre, §8 Compliance; business-plan-v2.md §11 |
| **Status** | Not started |

## Summary

The minimum the Personal Data Protection Act 2026 requires from day one: purpose-specific consent capture (SMS, app, AI processing, photo) with a versioned notice and a paper-consent record, and data subject rights (export, correction, deletion with legal hold). Lays the groundwork for the full compliance centre in F2-16.

## Scope

### 1. Consent capture
- Consent per purpose: SMS, app, AI processing, photo.
- Versioned consent notice; re-consent when the notice changes.
- Paper-consent record (scan or reference) for guardians without phones.
- Consent status gates F1-12 audiences and, later, F3-01 pseudonymisation exceptions.

### 2. Data subject rights
- Student record export (machine-readable and PDF).
- Correction request workflow.
- Deletion with **legal hold** (published results and financial records retained for statutory periods).

### 3. Groundwork for read audit
- Schema and hooks so that full-profile reads can be logged in F2-16.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S7 | 20–31 Dec 2026 | Consent capture |
| S16 | 4–15 Jul 2027 | PDPA subject rights (export, correction, deletion with legal hold) |

## Dependencies

- **Upstream (needs):** F1-03 (guardians), F1-01 (audit of consent).
- **Downstream (unblocks):** F1-12 audience filtering, F2-03 guardian consent management, F2-16 compliance centre, F3-01 in-country routing and pseudonymisation, F3-03j compliance monitor.

## Acceptance criteria

- [ ] Each guardian shows a consent status per purpose with the notice version consented to.
- [ ] Changing the notice version marks prior consents as needing renewal.
- [ ] An export contains everything held about the student across modules.
- [ ] A deletion request is blocked for records under legal hold, with the hold reason shown.
- [ ] Every consent change is in the audit log.

## Out of scope / deferred

- Consent-request SMS campaigns, statutory-clock access requests, retention purge, processing register, inference-routing switch (F2-16).
- Read audit of full-profile views (F2-16).

## Open questions

- Final PDPA 2026 rules text and statutory response clock for access requests.
- Who the Data Protection Contact is by default (Spec v2 §2 says usually the Admin Officer).
