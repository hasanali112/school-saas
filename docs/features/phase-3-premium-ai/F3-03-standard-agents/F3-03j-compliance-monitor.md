# F3-03j — Compliance Monitor Agent

| Field | Value |
|---|---|
| **Feature ID** | F3-03j |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S46 |
| **Milestone(s)** | M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 |
| **Status** | Not started |

## Summary

Weekly review of the consent and privacy centre: gaps per purpose, consents about to expire, drafts of consent-request notices, unusual full-profile read patterns, and confirmation that other agents are skipping non-consented subjects. Findings go to the Data Protection Contact.

## Agent definition (Spec v2 §3.8)

| Attribute | Value |
|---|---|
| **Trigger** | Weekly |
| **Reads** | Consent coverage, access logs, retention schedule |
| **Proposes** | Consent gaps, expiring consents, notice drafts, unusual read patterns |
| **Default policy** | Auto (read-only) |

## Scope

- Reads F2-16 coverage, read audit, retention schedule.
- Proposes notice drafts (consent-request SMS) → approval queue.
- Flags unusual read patterns (volume, off-hours, out-of-scope roles).
- Verifies consent-aware skipping in other agents' runs and reports exceptions.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S46 | 29 Oct–9 Nov 2028 | Compliance monitor (consent gaps, notice drafts, read patterns, consent-aware skipping) |

## Dependencies

- **Upstream (needs):** F3-01, F2-16, F1-15, F3-02.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] Weekly report lists gaps per purpose with counts and source rows.
- [ ] A staff member reading many full profiles outside their sections is flagged.
- [ ] Consent-request drafts are not sent without approval.

## Out of scope / deferred

- Any direct write to domain tables; the agent only proposes (Spec v2 §9).

## Open questions

- Definition of "unusual" read pattern thresholds.

