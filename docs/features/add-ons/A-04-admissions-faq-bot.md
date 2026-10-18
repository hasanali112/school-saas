# A-04 — Admissions FAQ Bot (Add-on)

| Field | Value |
|---|---|
| **Feature ID** | A-04 |
| **Phase** | Optional add-on (quoted separately) |
| **Tier availability** | Add-on for any tier with the website |
| **Sprints** | S51 |
| **Milestone(s)** | — (post-M8) |
| **Spec v2 reference** | — |
| **Status** | Not started (optional) |

## Summary

A bot on the public admission form (F1-14) that answers questions about fees, dates and required documents only, from institution-configured content, and hands anything else to the office contact.

## Scope

- Knowledge limited to fees, dates and documents configured for the admission round.
- Bangla and English.
- Out-of-scope questions get the office phone number, not a guess.
- No personal data collected; anonymous usage counts to the admissions CRM (F2-15).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S51 | 18–29 Mar 2029 | Admissions FAQ bot (bounded) |

## Dependencies

- **Upstream (needs):** F1-14 website, F1-04 admission info, F3-01 gateway.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] Questions about fee amounts return the configured values verbatim.
- [ ] A question about, say, teacher salaries is declined with the office contact.
- [ ] No conversation is stored beyond aggregate counts.

## Out of scope / deferred

- Filling the admission form on the applicant's behalf.

## Open questions

- Whether the bot should also run on WhatsApp (F2-13) for EduPro tenants.
