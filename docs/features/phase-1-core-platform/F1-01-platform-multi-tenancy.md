# F1-01 — Platform & Multi-tenancy

| Field | Value |
|---|---|
| **Feature ID** | F1-01 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | All tiers (platform foundation) |
| **Sprints** | S0, S7, S17, S18 |
| **Milestone(s)** | M1 (pilot-capable build), M3 (Phase 1 acceptance) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §2 Roles and principals, §6.28 Subscription & billing, §6.29 Platform tenant health, §8 Data, offline, and compliance |
| **Status** | Not started |

## Summary

The foundation every other module sits on: a shared PostgreSQL schema where every row carries an institution ID and row-level security (RLS) isolates tenants, plus the platform-side tooling Ontek uses to run the business (tenant admin, entitlements, billing, backups, monitoring). Nothing in this spec is visible to a school user except the audit trail and the subscription page.

## Scope

### 1. Multi-tenant database
- Shared Postgres schema; `institutionId` on every row.
- RLS enforced from a per-request setting; enforced before role and assignment checks.
- RLS test suite (delivered with F1-02 in S1) proves no cross-tenant read or write is possible.
- Enterprise tier may later use an isolated deployment (not in Phase 1).

### 2. Authentication
- OTP login and password login.
- Session and token handling that carries the tenant context for RLS.

### 3. Platform admin
- Tenant list and tenant detail.
- Tier entitlements per tenant; features outside the tier are **hidden, not greyed out**.
- Onboarding pipeline / checklist per tenant.
- Tenant health view and platform usage counters.

### 4. Subscription billing and metering
- Plan per tenant (Lite / Plus / Pro).
- Active-student count as the billing meter.
- Invoice PDF generation.
- SMS packs purchase and balance (ledger lives in F1-12).

### 5. Audit log and event log
- Audit table for every mutation of marks, money and consent.
- Event table that every module emits to (basis for F1-16 and Phase 3 Student 360).

### 6. Backups, security, monitoring
- Daily encrypted in-country backups.
- Restore drill in S7 and a second drill in S18.
- Security hardening; S18 security review covers OWASP Top 10, RLS bypass attempts and file uploads.
- Monitoring, alerts and runbooks.
- Load tests: 20 teachers entering marks concurrently; 1,500 report cards generated.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S0 | 13–24 Sep 2026 | Project setup, CI/CD, staging and production; multi-tenant DB with RLS; authentication (OTP and password); audit and event tables; seed data |
| S7 | 20–31 Dec 2026 | Platform admin (tenants, entitlements, onboarding checklist, usage counters); encrypted in-country backups and restore drill; security hardening |
| S17 | 18–29 Jul 2027 | Subscription billing and metering (plan per tenant, active-student count, invoice PDF, SMS packs); platform usage view; tenant health |
| S18 | 1–12 Aug 2027 | Concurrency and load tests; second restore drill; security review; monitoring and runbooks |

## Dependencies

- **Upstream (needs):** none; this is the root of the dependency graph.
- **Downstream (unblocks):** every other feature. F1-16 (agent-ready hooks) extends the event table. F3-01 (agent operating layer) relies on RLS to scope agent principals.

## Acceptance criteria

- [ ] A user of institution A cannot read or write any row of institution B through any API, proven by the RLS test suite.
- [ ] Both OTP and password login work and produce a session bound to one institution.
- [ ] Platform admin can create a tenant, set its tier, and see onboarding progress and health.
- [ ] Features not in a tenant's tier are absent from the UI rather than disabled.
- [ ] Monthly invoice PDF reflects the active-student count and the plan price.
- [ ] Every change to marks, money and consent writes an audit row with actor, before/after and reason where required.
- [ ] A backup taken yesterday can be restored to staging; two drills documented.
- [ ] Load test passes: 20 concurrent marks-entry users; 1,500 report cards in one batch.
- [ ] Security review closes all findings from OWASP Top 10, RLS bypass and upload tests.

## Out of scope / deferred

- Isolated (single-tenant) deployment for enterprise customers.
- Agent principals, scoped tokens and credit metering (F3-01, F3-02).
- Read audit of full-profile views (groundwork in F1-15, delivered in F2-16).

## Open questions

- Definition of "active student" for metering (enrolled in current session? attendance in last 30 days?).
- Where in-country backups are hosted and who holds the encryption keys.
- Whether platform admin actions themselves are audited (recommended: yes).
