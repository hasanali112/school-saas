# Ontek EduSmart — Feature List & Sprint Division (Two Developers)

*Companion to quotation OES-Q-2026-001, 6 September 2026. January and February are non-development months in every year; no sprints are scheduled then.*

## Phases at a glance

| Phase | Sprints | Development window | Acceptance milestone |
|---|---|---|---|
| Phase 1 — Core Platform | 20 | 13 Sep 2026 – 26 Aug 2027 (excluding Jan–Feb 2027) | M3 · EduLite 1.0 accepted · 26 Aug 2027 |
| Phase 2 — Advanced Features | 17 | 29 Aug 2027 – 22 Jun 2028 (excluding Jan–Feb 2028) | M6 · Release 2.x accepted · 22 Jun 2028 |
| Phase 3 — Premium AI (Agent-Native) | 13 | 25 Jun 2028 – 21 Dec 2028 | M8 · Release 3.0 accepted · 21 Dec 2028 |
| **Total** | **50** | 13 Sep 2026 – 21 Dec 2028 | |

## Part A — Feature list by phase

### Phase 1 — Core Platform (EduLite)

| Module | Features |
|---|---|
| **Platform & multi-tenancy** | Shared PostgreSQL schema with institution-level row security; platform admin (tenants, tier entitlements hidden rather than greyed, onboarding pipeline, tenant health); subscription billing and metering (active-student count, invoice PDF, SMS packs); audit log for marks, money and consent; event log; daily encrypted in-country backups with tested restore; security hardening; monitoring and alerts. |
| **Institution setup** | Institution profile in Bangla and English (EIIN, logo, letterhead, seal, signatures); sessions, shifts, classes, sections, groups, subjects including 4th subject and religion variants; teacher–subject–section assignment; users, roles and permissions per Spec v2 §2; government and institution holiday calendar; per-user language toggle. |
| **Students (Digital Register)** | Student record with Bangla and English names, admission number, per-session roll and section, identity documents, blood group, religion, address, photo; guardians keyed by phone; lifecycle states; Bangla-aware search; Excel bulk import with dry-run and downloadable error file (Primary Data Entry); promotion wizard and session rollover; student exit; list conventions (filters, saved views, column chooser, export, print, bulk actions). |
| **Admission** | Public admission form on the institution website; applications pipeline; admission test marks; merit list generation and publishing; roll and section allocation that creates the student record; SMS to selected applicants. |
| **Attendance & leave** | Once-daily or per-period attendance; web page and offline-capable PWA with visible sync status; rules (assigned classes only, same-day edit, admin-only backdating, full audit); monthly register; monthly percentage and stipend eligibility (75%) report; staff attendance; leave types, applications and approvals for staff and students. |
| **Exam management** | Exam types and setup per class and group; subject components (CQ / MCQ / Practical); versioned grading rules with NCTB 2026 and 2027 presets, locked once published against; marks entry with autosave, absent flag, submit and lock, reopen, Excel import and export, blank sheet print; entry status board; tabulation sheet (A4 landscape); GPA, 4th-subject rule and merit position with tie rules; publish and 24-hour unpublish with audit; report cards (Bangla and English layouts, batch PDF); result SMS; website result lookup; admit cards; seat plans. |
| **Fees & billing** | Fee heads and structure per class, group and session; monthly invoices; collection counter with gapless receipt numbering; receipts for 80 mm thermal and A5; partial payments; cash, bKash TrxID and bank-slip modes; waivers with approval; void with reason; student ledger; dues engine and ageing; due list with reminder SMS; collection reports (daily, head-wise, class-wise); cashbook. |
| **Accounts** | School-oriented chart of accounts; receipt, payment and journal vouchers; automatic posting of fee collections; ledger, cashbook, bank book; income–expenditure statement; trial balance; budget vs actual; period lock. |
| **Class routine** | Weekly grid per class-section with period timings per shift; teacher conflict detection; print per class and per teacher; manual substitute assignment; teacher workload view; change history. |
| **Academics** | Homework per class-subject with attachments; assignments with submission tracking; targeted notices; materials library (Document Management); Office Today and Teacher Today pages v1. |
| **Documents & certificates** | Template engine (Bangla and English, letterhead, seal, signatures, merge fields); ID cards (CR80, batch PDF); testimonials; transfer certificates with dues-clearance check; character certificates; numbered registers; reprint and cancel. |
| **SMS notification** | Dual-gateway SMS service with failover; Unicode segment counting and cost preview before every send; templates and merge fields; audience builder; scheduling; delivery-report log; per-institution balance ledger; absence and result SMS. |
| **Smart reports** | Report centre: attendance (monthly, class), collection (daily, monthly, head-wise), dues ageing, result summary, student strength by class, gender, religion and age, staff list, SMS usage; Excel and PDF export; scheduled reports; letterheaded print. |
| **Institution website** | Bangla and English template: home, notices, about, admission information, admission form, result lookup, contact; custom domain mapping. |
| **Compliance (PDPA 2026)** | Consent capture per purpose (SMS, app, AI processing, photo) with versioned notice and paper-consent record; student record export, correction and deletion with legal hold; groundwork for read audit. |
| **Agent-ready hooks** | Event emission from every module, proposals and approvals schema, pseudonymous identifiers in read APIs — so Phase 3 plugs in without rework. |
| **Release & enablement** | Verification-day diff tool (institution tabulation vs system); Bangla import templates; demo tenant; in-app help links; tier configuration; technical and user documentation. |

### Phase 2 — Advanced Features (EduPlus / EduPro)

| Module | Features |
|---|---|
| **Mobile app (one app, four modes)** | Flutter app for Android 8+ under 30 MB; phone + OTP and biometric login; offline store and sync engine (queued writes, per-cell conflict rule with audit, visible sync status); push notifications with SMS-fallback rule (app notification at no SMS cost); guardian–child linking by phone. |
| **Teacher mode** | Today's periods; one-tap offline attendance; offline marks entry; homework setting; assignment review; routine; notices; student lookup; leave application. |
| **Guardian mode** | Child selector; attendance; dues and pay-now; results and report card PDF; homework; routine; notices; leave application; message the class teacher; consent management. |
| **Head mode** | Today's numbers, collection vs target, attendance heat, absent staff, classes not taken with one-tap reminder; message anyone; waiver and leave approvals; rule-based at-risk list. |
| **Online fee collection** | SSLCommerz integration covering bKash, Nagad, Rocket and cards; pay-now from app and website; IPN validation; automatic receipts; online payment log; settlement reconciliation; per-institution merchant credentials; payment link by SMS from the counter. |
| **Biometric attendance** | ZKTeco ADMS push integration; device registration; student and staff mapping; punch-to-attendance rules (first-in, last-out, late threshold per shift); store-and-forward; USB log import; device health page. |
| **Integrations hub** | Cards for SMS gateways (primary and secondary), payment gateway, biometric devices and WhatsApp: connect, test, rotate keys, last sync. |
| **Payroll & HR** | Salary structures with MPO and institution split; allowances and deductions; provident fund ledger; monthly payroll run with automatic posting to accounts; payslip PDF; service record (joining, increments, promotions); leave-balance link. |
| **Library & inventory** | Library: accession register, members, issue and return, fines, push reminders, camera barcode scanning. Inventory: items, stock in and out, departmental issue, low-stock alerts. |
| **Transport & hostel** | Transport: routes, stops, vehicles, drivers, student assignment, fee-head link. Hostel: buildings, rooms, beds, allocation, hostel fee, night roll call, visitor log. |
| **Statutory returns & board forms** | BANBEIS annual survey, DSHE monthly return, stipend eligibility list and MPO staff statement pre-filled with unknowns highlighted and exported in the accepted layouts; board registration and form fill-up with e-SIF export. |
| **Committee portal** | Read-only governing-body portal: monthly summary, head's report, meeting calendar, minutes archive, resolutions tracker. |
| **WhatsApp channel** | WhatsApp Business API via a Business Solution Provider: template management with approval status, media messages (report cards, notices), opt-in tracking, replies into the guardian inbox, cost preview. EduPro entitlement. |
| **Custom reports & templates** | Visual report builder (entity → fields → filters → grouping; save, schedule, letterhead); document template editor with merge-field picker. |
| **Admissions CRM & Student 360** | Enquiry pipeline (enquiry → form → test → selected → admitted), sources, follow-up tasks, conversion by source, seat availability; Student 360 timeline built from the event log; guardian inbox routed to class teachers. |
| **Compliance centre** | Consent and privacy centre v1 (coverage per purpose, consent-request SMS, paper consent, access requests with statutory clock, retention purge, processing register export, inference-routing switch); read audit of full-profile views; counter close and reconciliation (cash vs receipts, gateway and bank-slip matching, discrepancy list). |
| **Release 2.x** | Plan-change preview; sync stress tests; crash monitoring; Play Store production release with Bangla listing; documentation. |

### Phase 3 — Premium AI (Agent-native)

| Module | Features |
|---|---|
| **Agent operating layer** | Agent registry with the full anatomy of Spec v2 §3.1; agents as principals with scoped tokens enforced by row-level security; typed read and propose tools (pseudonymised by default; no execute tool exposed to the model); run orchestrator (schedule, event, manual); run log with tools, tokens and cost; kill switch; model gateway with small, standard and frontier tiers, retries, pseudonymisation and in-country routing switch; Bangla prompt templates; evaluation harness; degraded modes (no credits, model unavailable). |
| **Approval & governance** | Approval queue (batches, per-item edit and skip, approve, reject with reason, cost, 48-hour ageing, diff view, "why this" with source rows) on web and head mode; approval policies (Always, Batch, Auto with limits, Auto; loosening is Head-only and permanently audited); per-run and per-recipient limits; structured memory with inspect and clear; credits ledger and metering by tier; agent console; credits page; agent tray; evaluation dashboard; platform agent tuning panel. |
| **Standard agents (12)** | Result analysis · Remark writer · Fee reminder · Attendance watch · Morning brief · Dropout risk v1 · Collection reconciliation · Routine repair · Compliance monitor · Statutory return prep · Register digitiser · Question paper drafter. |
| **Assisted pages** | Head's Today with ranked decision list; result analytics page; marks-entry anomaly detection; status-board reminder drafts; due-list segments; students-to-watch; Student 360 summary; routine options with trade-offs and conflict explanation; guardian inbox drafting with urgent-flag rule; homework drafts from lesson plan. |
| **Ask-your-data command bar** | Bangla and English natural-language bar (Ctrl/⌘-K, long-press on mobile): ask mode over a whitelisted semantic layer with source rows; do mode that opens filtered pages or creates proposals; never a direct mutation; every query audited. |
| **Migration studio** | Register photos and Excel to structured proposals with per-cell confidence; duplicate detection; cross-checks (dues vs receipts, roll continuity); staged tenant; review by confidence; verification-day comparison; commit. |
| **Creation tools** | Question paper studio (question bank, NCTB distributions, drafting from bank, coverage and duplication checks, Bangla proofreading, answer key and rubric, DOCX and PDF export, lock and seal); workflow builder (guarded blocks, no code, sentence to workflow); natural-language custom reports; committee monthly report drafting. |
| **Release 3.0** | The five-point agent-native definition (Spec v2 §10) demonstrable end to end; documentation; demo tenant refresh. |

### Optional add-ons (quoted separately)

| Add-on | Description |
|---|---|
| **Voice attendance** | Bangla speech to roll numbers with read-back confirmation in teacher mode. |
| **Scan attendance & mark sheets** | Photo of a paper register or mark sheet to proposals with confidence, cell-by-cell confirm. |
| **Student study helper** | Bounded to the syllabus and the institution's own materials; refuses assignments; aggregate usage to the class teacher. |
| **Admissions FAQ bot** | Bounded to fees, dates and documents on the public admission form. |
| **Committee minutes from recording** | Bangla speech-to-text of meeting audio to draft minutes for the Head's review. |

## Part B — Sprints by phase, with features divided into sprints

### Phase 1 — Core Platform · 20 sprints

| Sprint | Dates | Features delivered |
|---|---|---|
| **S0** | 13–24 Sep 2026 | Project setup, CI/CD, staging and production environments; multi-tenant database with row-level security; authentication (OTP and password); audit and event tables; Bangla/English i18n; design system with Bangla fonts; application shell; Bangla PDF print pipeline; seed data. |
| **S1** | 27 Sep–8 Oct | Institution profile (Bangla/English, EIIN, letterhead, seal); sessions, shifts, classes, sections, groups, subjects (4th subject, religion variants); teacher assignments; users, roles, permissions; RLS test suite. |
| **S2** | 11–22 Oct | Student records (Bangla/English), guardians, photos, lifecycle, Bangla search; Excel bulk import with dry-run and error file; students list conventions. (Durga Puja ~19–21 Oct.) |
| **S3** | 25 Oct–5 Nov | Attendance (daily or per-period) on web; monthly register; monthly % and stipend (75%) report; staff attendance; leave types, apply and approve; holiday calendar. |
| **S4** | 8–19 Nov | SMS service (dual gateway, Unicode segments, templates, merge fields, cost preview, scheduling, delivery log, balance ledger); SMS composer and log; absence SMS; offline PWA attendance with sync status. |
| **S5** | 22 Nov–3 Dec | Fee heads and structure; invoices; collection counter; gapless receipts (thermal and A5); partial payments; cash, bKash TrxID and bank-slip modes; waivers with approval; void with reason; student ledger. |
| **S6** | 6–17 Dec | Dues engine and ageing; due list with reminder SMS; collection reports; cashbook; admission applications and roll/section allocation; ID card generator (batch PDF). (16 Dec holiday.) |
| **S7** | 20–31 Dec | Platform admin (tenants, entitlements, onboarding checklist, usage counters); encrypted in-country backups and restore drill; security hardening; consent capture; institution website v1 and custom domain; Office Today v1. → M1 pilot-capable build. |
| — | Jan–Feb 2027 | No development. Optional pilot at 2–3 institutions on the M1 build for the January 2027 session, supported by Ontek's own team. |
| **S8** | 14–25 Mar 2027 | Exam types and setup; subject components (CQ/MCQ/Practical); versioned grading rules engine with NCTB 2026 and 2027 presets; result computation (grades, GPA, 4th subject, merit, tie rules); reproduction tests against three real tabulation sheets. |
| **S9** | 28 Mar–8 Apr | Marks entry (autosave, absent, submit and lock, reopen, audit); blank mark-sheet print; Excel import and export; entry status board with manual reminders; deadline extension. |
| **S10** | 11–22 Apr | Tabulation sheet (frozen columns, A4 landscape); publish workflow (freeze marks and rule version, 24-hour unpublish); report cards (Bangla and English layouts, batch PDF); result.published event. (14 Apr holiday.) |
| **S11** | 25 Apr–6 May | Result SMS (segment-optimised); publish → SMS review; website result lookup; previous-exam comparison; admit cards; seat plans; exam print QA. → M2 exam module complete. (1 May holiday.) |
| **S12** | 9–20 May | Accounts: chart of accounts; receipt, payment and journal vouchers; automatic posting of fees; ledger, cashbook, bank book; income–expenditure statement; trial balance; budget vs actual; period lock. (Eid-ul-Adha ~16–17 May.) |
| **S13** | 23 May–3 Jun | Homework; assignments with submissions; targeted notices; materials library; Teacher Today v1; routine builder v1 (grid, period timings per shift, conflicts, print per class and teacher). |
| **S14** | 6–17 Jun | Document template engine; testimonials; transfer certificates with dues-clearance check; character certificates; numbered registers; reprint and cancel; promotion wizard and session rollover; student exit. |
| **S15** | 20 Jun–1 Jul | Report centre (attendance, collection, dues ageing, result summary, student strength, staff, SMS usage); Excel and PDF export; scheduled reports; staff records (service basics, MPO index); routine v2 (substitutes, workload, history). |
| **S16** | 4–15 Jul | Admission: public form on website, application pipeline, admission test marks, merit list and publishing, SMS to selected; PDPA subject rights (export, correction, deletion with legal hold). |
| **S17** | 18–29 Jul | Subscription billing and metering (plan per tenant, active-student count, invoice PDF, SMS packs); platform usage view; tenant health; agent-ready hooks (events emitted, proposals and approvals schema, pseudonymous IDs). |
| **S18** | 1–12 Aug | Hardening: concurrency and load tests (20 teachers entering marks; 1,500 report cards); second restore drill; security review (OWASP Top 10, RLS bypass, uploads); Bangla typography and print QA on real printers; monitoring and runbooks. |
| **S19** | 15–26 Aug | Release 1.0: verification-day diff tool; Bangla import templates; demo tenant; in-app help links; tier configuration (Lite/Plus/Pro); technical debt; documentation. → M3 Phase 1 acceptance. |

### Phase 2 — Advanced Features · 17 sprints

| Sprint | Dates | Features delivered |
|---|---|---|
| **S20** | 29 Aug–9 Sep 2027 | Flutter app foundation (one app, role modes); phone + OTP and biometric login; local store; offline sync engine; mobile API and delta sync; push notifications with SMS-fallback rule; guardian–child linking. |
| **S21** | 12–23 Sep | Teacher mode I: today's periods, one-tap offline attendance, routine, notices, student lookup, leave application; low-end device testing. |
| **S22** | 26 Sep–7 Oct | Teacher mode II: offline marks entry, set homework, review assignments, attachment compression; Play Store internal-testing track. (Durga Puja ~early Oct.) |
| **S23** | 10–21 Oct | Guardian mode: child selector, attendance, dues, results and report card PDF, homework, routine, notices, leave application, message class teacher, consent screen; guardian inbox routing. |
| **S24** | 24 Oct–4 Nov | Online fees: SSLCommerz (bKash, Nagad, Rocket, cards) from app and website; IPN validation; automatic receipts; online payment log; settlement reconciliation; per-institution merchant credentials; payment link by SMS from the counter. |
| **S25** | 7–18 Nov | Biometric: ZKTeco ADMS push endpoint, device registration, user mapping, punch-to-attendance rules, store-and-forward, USB log import, devices page; Integrations hub v1. |
| **S26** | 21 Nov–2 Dec | Head mode: today's numbers, collection vs target, absent staff, classes not taken with reminder, message anyone, waiver and leave approvals, rule-based at-risk list; Play Store production release v1 with Bangla listing. → M4. |
| **S27** | 5–16 Dec | Payroll: salary structure with MPO split, allowances and deductions, provident fund ledger, monthly payroll run with auto-posting, payslips, service record, leave-balance link. (16 Dec holiday.) |
| **S28** | 19–30 Dec | Library (accession, members, issue and return, fines, push reminders, camera barcode); inventory (items, stock, issue, low-stock); plan-change preview; sync stress tests; crash monitoring; release 2.0. → M5 EduPlus/EduPro sellable. |
| — | Jan–Feb 2028 | No development. Signing and onboarding season for Ontek. |
| **S29** | 5–16 Mar 2028 | Transport (routes, stops, vehicles, drivers, assignment, fee link); hostel (rooms, beds, allocation, fee, night roll call, visitor log). |
| **S30** | 19–30 Mar | Statutory returns: BANBEIS annual survey, DSHE monthly return, stipend eligibility list, MPO staff statement; pre-fill with unknowns highlighted; exact export layouts. (26 Mar holiday.) |
| **S31** | 2–13 Apr | Board registration and form fill-up (board layout, photo specs, eligibility, e-SIF export); committee portal (read-only summary, head's report, meeting calendar, minutes archive, resolutions). |
| **S32** | 16–27 Apr | WhatsApp Business channel via BSP: templates and approval status, media messages, opt-in tracking, replies into guardian inbox, cost preview; composer and inbox unification. |
| **S33** | 30 Apr–11 May | Custom report builder (entity → fields → filters → grouping; save, schedule, letterhead); document template editor with merge-field picker. (1 May; Eid-ul-Adha ~5–6 May.) |
| **S34** | 14–25 May | Admissions CRM (enquiry pipeline, sources, follow-ups, conversion, seat availability); Student 360 timeline from events; PDPA read audit of full-profile views. |
| **S35** | 28 May–8 Jun | Consent and privacy centre v1 (coverage, consent-request SMS, paper consent, access requests with statutory clock, retention purge, processing register, inference-routing switch); counter close and reconciliation. |
| **S36** | 11–22 Jun | Hardening and release 2.x: regression, performance, security review, app store update, documentation. → M6 Phase 2 acceptance. |

### Phase 3 — Premium AI · 13 sprints

| Sprint | Dates | Features delivered |
|---|---|---|
| **S37** | 25 Jun–6 Jul 2028 | Agent OS I: agent registry, agent principals with scoped tokens under RLS, typed read and propose tools (pseudonymised), run orchestrator (schedule, event, manual), run log with cost, kill switch, model gateway (tiers, retries, pseudonymisation, in-country routing switch), Bangla prompt templates, evaluation harness. |
| **S38** | 9–20 Jul | Agent OS II: approval queue (web and head-mode swipe), approval policies with audited loosening, per-run and per-recipient limits, structured memory, credits ledger and metering, agent console, credits page, agent tray and badge. |
| **S39** | 23 Jul–3 Aug | Result analysis agent (cached, Bangla narrative, weak-topic notes, at-risk ranking) and result analytics page; remark writer (batch review, approved remarks on report cards). |
| **S40** | 6–17 Aug | Fee reminder agent (segments, tone, caps); attendance watch agent (flags, absence drafts); degraded modes; evaluation dashboard (acceptance rate, alerts). → M7 Agent OS and four agents live. |
| **S41** | 20–31 Aug | Morning brief agent; Head's Today with ranked decision list; brief page and head-mode brief; platform agent tuning panel (per-tenant acceptance, prompt overrides, audited). |
| **S42** | 3–14 Sep | Ask-your-data command bar (Bangla/English; ask mode over a semantic layer with source rows; do mode to filtered pages or proposals); web and mobile; query audit. |
| **S43** | 17–28 Sep | Marks anomaly detection and status-board drafts; dropout risk v1 (ranked with reasons and interventions); Student 360 summary; at-risk lists in head mode. |
| **S44** | 1–12 Oct | Collection reconciliation explanation and shortage-pattern alerts; routine repair agent (substitutes on approved leave); routine options with trade-offs; conflict explanation. (Durga Puja ~late Sep/early Oct.) |
| **S45** | 15–26 Oct | Register digitiser and migration studio I: OCR of Bangla registers and Excel, per-cell confidence, duplicate detection, cross-checks, staged tenant, review by confidence. |
| **S46** | 29 Oct–9 Nov | Migration studio II (verification-day comparison, commit); guardian inbox drafting with urgent-flag rule; homework drafts in teacher mode; compliance monitor (consent gaps, notice drafts, read patterns, consent-aware skipping). |
| **S47** | 12–23 Nov | Statutory return prep agent; natural-language report builder; committee monthly report drafting. |
| **S48** | 26 Nov–7 Dec | Question paper studio I: question bank, NCTB distribution presets, drafting from bank, coverage and duplication checks, Bangla proofreading, answer key and rubric. |
| **S49** | 10–21 Dec | Question paper studio II (lock and seal, DOCX/PDF export); workflow builder (guarded blocks, sentence to workflow); release 3.0. → M8 Phase 3 acceptance. (16 Dec holiday.) |

### Optional add-ons · 3 sprints (Mar–Apr 2029)

| Sprint | Dates | Features delivered |
|---|---|---|
| **S50** | 4–15 Mar 2029 | Voice attendance; scan attendance and mark sheets. |
| **S51** | 18–29 Mar | Student study helper (bounded); admissions FAQ bot (bounded). (26 Mar holiday.) |
| **S52** | 1–12 Apr | Committee minutes from recording; regression and release. |

## Part C — Milestones and payment triggers

| # | Milestone | Target date | Payment trigger |
|---|---|---|---|
| M0 | Kick-off | 13 Sep 2026 | — |
| M1 | Pilot-capable build (students, admission lite, attendance web + offline PWA, fees, SMS, ID cards, website v1, consent) | 31 Dec 2026 | Phase 1 · 30% |
| M2 | Exam module complete (rules engine, marks entry, tabulation, report cards, result SMS) | 6 May 2027 | Phase 1 · 20% |
| M3 | Phase 1 acceptance — EduLite 1.0 | 26 Aug 2027 | Phase 1 · 20% |
| M4 | Mobile app in production (teacher, guardian, head modes) with online fees and biometric | 2 Dec 2027 | — |
| M5 | Release 2.0 — EduPlus / EduPro sellable (payroll, library, inventory included) | 30 Dec 2027 | Phase 2 · 30% |
| M5a | Statutory returns and board forms complete | 13 Apr 2028 | Phase 2 · 20% |
| M6 | Phase 2 acceptance — Release 2.x | 22 Jun 2028 | Phase 2 · 20% |
| M7 | Agent operating layer and four standard agents live | 17 Aug 2028 | Phase 3 · 30% |
| M7a | Migration studio complete | 9 Nov 2028 | Phase 3 · 20% |
| M8 | Phase 3 acceptance — Release 3.0 agent-native | 21 Dec 2028 | Phase 3 · 20% |

Pricing basis: BDT 80,000 per developer per sprint × 2 developers = BDT 1,60,000 per sprint. Phase 1 BDT 32,00,000 · Phase 2 BDT 27,20,000 · Phase 3 BDT 20,80,000 · Total BDT 80,00,000 (excl. taxes). Full commercial terms are in the quotation document.