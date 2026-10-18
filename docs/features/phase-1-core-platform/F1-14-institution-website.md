# F1-14 — Institution Website

| Field | Value |
|---|---|
| **Feature ID** | F1-14 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite, EduPlus, EduPro (custom domain and hosting billed annually) |
| **Sprints** | S7 (v1), S11 (result lookup), S16 (admission form) |
| **Milestone(s)** | M1 |
| **Spec v2 reference** | — (business plan §6 "Custom domain + website hosting") |
| **Status** | Not started |

## Summary

A templated public website per institution in Bangla and English: home, notices, about, admission information, admission form, result lookup and contact, with custom domain mapping. It is the public face of the tenant and the entry point for admissions and results.

## Scope

### 1. Pages
- Home, notices, about, admission information, contact.
- Admission form (F1-04).
- Result lookup by roll (F1-06).

### 2. Hosting
- Custom domain mapping; TLS provisioning.
- Content managed from the admin app (notices flow from F1-10).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S7 | 20–31 Dec 2026 | Institution website v1 and custom domain |
| S11 | 25 Apr–6 May 2027 | Website result lookup |
| S16 | 4–15 Jul 2027 | Public admission form on website |

## Dependencies

- **Upstream (needs):** F1-02 (profile, logo), F1-10 (notices), F1-06 (published results), F1-04 (applications).
- **Downstream (unblocks):** F2-05 pay-now from website, A-04 admissions FAQ bot.

## Acceptance criteria

- [ ] A new tenant gets a working site on a platform subdomain immediately; mapping a custom domain works with valid TLS.
- [ ] Result lookup returns only published results and only for the roll entered.
- [ ] Notices published in the admin app appear on the site without further action.

## Out of scope / deferred

- Page builder / arbitrary layouts.
- Online payments from the website (F2-05).

## Open questions

- Whether result lookup needs a second factor (date of birth) to reduce scraping.
