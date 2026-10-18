# Ontek EduSmart — Feature Specifications

Individual feature specs extracted from [Ontek-EduSmart-Feature-List-and-Sprints.md](../Ontek-EduSmart-Feature-List-and-Sprints.md) (companion to quotation OES-Q-2026-001, 6 Sep 2026). One spec per module row in the source; the twelve standard agents each get their own spec. Every spec follows [_template.md](_template.md) and links to the relevant section of [product-spec-v2.md](../../product-spec-v2.md) ("Spec v2").

Layout:

```
docs/features/
├── README.md                      this index
├── _template.md                   spec template
├── phase-1-core-platform/         F1-01 … F1-17  (EduLite, 20 sprints, S0–S19)
├── phase-2-advanced-features/     F2-01 … F2-17  (EduPlus/EduPro, 17 sprints, S20–S36)
├── phase-3-premium-ai/            F3-01 … F3-08  (Agent-native, 13 sprints, S37–S49)
│   └── F3-03-standard-agents/     F3-03a … F3-03l (one per agent)
└── add-ons/                       A-01 … A-05    (optional, S50–S52)
```

January and February are non-development months every year.

## Phase 1 — Core Platform (EduLite) · 13 Sep 2026 – 26 Aug 2027

| ID | Feature | Sprints | Milestone |
|---|---|---|---|
| [F1-01](phase-1-core-platform/F1-01-platform-multi-tenancy.md) | Platform & multi-tenancy | S0, S7, S17, S18 | M1, M3 |
| [F1-02](phase-1-core-platform/F1-02-institution-setup.md) | Institution setup | S0, S1, S3 | M1 |
| [F1-03](phase-1-core-platform/F1-03-students-digital-register.md) | Students (Digital Register) | S2, S14 | M1 |
| [F1-04](phase-1-core-platform/F1-04-admission.md) | Admission | S6, S16 | M1, M3 |
| [F1-05](phase-1-core-platform/F1-05-attendance-and-leave.md) | Attendance & leave | S3, S4 | M1 |
| [F1-06](phase-1-core-platform/F1-06-exam-management.md) | Exam management | S8–S11 | M2 |
| [F1-07](phase-1-core-platform/F1-07-fees-and-billing.md) | Fees & billing | S5, S6 | M1 |
| [F1-08](phase-1-core-platform/F1-08-accounts.md) | Accounts | S12 | M3 |
| [F1-09](phase-1-core-platform/F1-09-class-routine.md) | Class routine | S13, S15 | M3 |
| [F1-10](phase-1-core-platform/F1-10-academics.md) | Academics | S7, S13 | M1, M3 |
| [F1-11](phase-1-core-platform/F1-11-documents-and-certificates.md) | Documents & certificates | S0, S6, S14 | M1, M3 |
| [F1-12](phase-1-core-platform/F1-12-sms-notification.md) | SMS notification | S4, S6, S11 | M1 |
| [F1-13](phase-1-core-platform/F1-13-smart-reports.md) | Smart reports | S15 | M3 |
| [F1-14](phase-1-core-platform/F1-14-institution-website.md) | Institution website | S7, S11, S16 | M1 |
| [F1-15](phase-1-core-platform/F1-15-compliance-pdpa.md) | Compliance (PDPA 2026) | S7, S16 | M1, M3 |
| [F1-16](phase-1-core-platform/F1-16-agent-ready-hooks.md) | Agent-ready hooks | S0, S17 | M3 |
| [F1-17](phase-1-core-platform/F1-17-release-and-enablement.md) | Release & enablement (EduLite 1.0) | S18, S19 | M3 |

## Phase 2 — Advanced Features (EduPlus / EduPro) · 29 Aug 2027 – 22 Jun 2028

| ID | Feature | Sprints | Milestone |
|---|---|---|---|
| [F2-01](phase-2-advanced-features/F2-01-mobile-app-platform.md) | Mobile app platform (one app, four modes) | S20, S22, S26, S28 | M4 |
| [F2-02](phase-2-advanced-features/F2-02-teacher-mode.md) | Teacher mode | S21, S22 | M4 |
| [F2-03](phase-2-advanced-features/F2-03-guardian-mode.md) | Guardian mode | S23 | M4 |
| [F2-04](phase-2-advanced-features/F2-04-head-mode.md) | Head mode | S26 | M4 |
| [F2-05](phase-2-advanced-features/F2-05-online-fee-collection.md) | Online fee collection | S24 | M4 |
| [F2-06](phase-2-advanced-features/F2-06-biometric-attendance.md) | Biometric attendance | S25 | M4 |
| [F2-07](phase-2-advanced-features/F2-07-integrations-hub.md) | Integrations hub | S25, S32 | M4 |
| [F2-08](phase-2-advanced-features/F2-08-payroll-and-hr.md) | Payroll & HR | S15, S27 | M5 |
| [F2-09](phase-2-advanced-features/F2-09-library-and-inventory.md) | Library & inventory | S28 | M5 |
| [F2-10](phase-2-advanced-features/F2-10-transport-and-hostel.md) | Transport & hostel | S29 | M6 |
| [F2-11](phase-2-advanced-features/F2-11-statutory-returns-and-board-forms.md) | Statutory returns & board forms | S30, S31 | M5a |
| [F2-12](phase-2-advanced-features/F2-12-committee-portal.md) | Committee portal | S31 | M5a |
| [F2-13](phase-2-advanced-features/F2-13-whatsapp-channel.md) | WhatsApp channel (EduPro) | S32 | M6 |
| [F2-14](phase-2-advanced-features/F2-14-custom-reports-and-templates.md) | Custom reports & templates | S33 | M6 |
| [F2-15](phase-2-advanced-features/F2-15-admissions-crm-and-student-360.md) | Admissions CRM & Student 360 | S23, S34 | M6 |
| [F2-16](phase-2-advanced-features/F2-16-compliance-centre.md) | Compliance centre | S34, S35 | M6 |
| [F2-17](phase-2-advanced-features/F2-17-release-2x.md) | Release 2.x | S28, S36 | M5, M6 |

## Phase 3 — Premium AI (Agent-native) · 25 Jun 2028 – 21 Dec 2028

| ID | Feature | Sprints | Milestone |
|---|---|---|---|
| [F3-01](phase-3-premium-ai/F3-01-agent-operating-layer.md) | Agent operating layer | S37, S40 | M7 |
| [F3-02](phase-3-premium-ai/F3-02-approval-and-governance.md) | Approval & governance | S38, S40, S41 | M7 |
| [F3-03](phase-3-premium-ai/F3-03-standard-agents/README.md) | Standard agents (12) — see sub-index | S39–S49 | M7, M7a, M8 |
| [F3-04](phase-3-premium-ai/F3-04-assisted-pages.md) | Assisted pages | S39, S41, S43, S44, S46 | M8 |
| [F3-05](phase-3-premium-ai/F3-05-ask-your-data-command-bar.md) | Ask-your-data command bar | S42 | M8 |
| [F3-06](phase-3-premium-ai/F3-06-migration-studio.md) | Migration studio | S45, S46 | M7a |
| [F3-07](phase-3-premium-ai/F3-07-creation-tools.md) | Creation tools | S47–S49 | M8 |
| [F3-08](phase-3-premium-ai/F3-08-release-3.md) | Release 3.0 | S49 | M8 |

### Standard agents

| ID | Agent | Sprint |
|---|---|---|
| [F3-03a](phase-3-premium-ai/F3-03-standard-agents/F3-03a-result-analysis.md) | Result analysis | S39 |
| [F3-03b](phase-3-premium-ai/F3-03-standard-agents/F3-03b-remark-writer.md) | Remark writer | S39 |
| [F3-03c](phase-3-premium-ai/F3-03-standard-agents/F3-03c-fee-reminder.md) | Fee reminder | S40 |
| [F3-03d](phase-3-premium-ai/F3-03-standard-agents/F3-03d-attendance-watch.md) | Attendance watch | S40 |
| [F3-03e](phase-3-premium-ai/F3-03-standard-agents/F3-03e-morning-brief.md) | Morning brief | S41 |
| [F3-03f](phase-3-premium-ai/F3-03-standard-agents/F3-03f-dropout-risk.md) | Dropout risk v1 | S43 |
| [F3-03g](phase-3-premium-ai/F3-03-standard-agents/F3-03g-routine-repair.md) | Routine repair | S44 |
| [F3-03h](phase-3-premium-ai/F3-03-standard-agents/F3-03h-collection-reconciliation.md) | Collection reconciliation | S44 |
| [F3-03i](phase-3-premium-ai/F3-03-standard-agents/F3-03i-register-digitiser.md) | Register digitiser | S45 |
| [F3-03j](phase-3-premium-ai/F3-03-standard-agents/F3-03j-compliance-monitor.md) | Compliance monitor | S46 |
| [F3-03k](phase-3-premium-ai/F3-03-standard-agents/F3-03k-statutory-return-prep.md) | Statutory return prep | S47 |
| [F3-03l](phase-3-premium-ai/F3-03-standard-agents/F3-03l-question-paper-drafter.md) | Question paper drafter | S48–S49 |

## Optional add-ons (quoted separately) · Mar–Apr 2029

| ID | Add-on | Sprint |
|---|---|---|
| [A-01](add-ons/A-01-voice-attendance.md) | Voice attendance | S50 |
| [A-02](add-ons/A-02-scan-attendance-and-mark-sheets.md) | Scan attendance & mark sheets | S50 |
| [A-03](add-ons/A-03-student-study-helper.md) | Student study helper | S51 |
| [A-04](add-ons/A-04-admissions-faq-bot.md) | Admissions FAQ bot | S51 |
| [A-05](add-ons/A-05-committee-minutes-from-recording.md) | Committee minutes from recording | S52 |

## Milestones

| # | Milestone | Date | Features that must be complete | Payment |
|---|---|---|---|---|
| M0 | Kick-off | 13 Sep 2026 | — | — |
| M1 | Pilot-capable build | 31 Dec 2026 | F1-01 (S0, S7), F1-02, F1-03 (S2), F1-04 (lite), F1-05, F1-07, F1-10 (Office Today), F1-11 (ID cards), F1-12, F1-14 (v1), F1-15 (consent) | Phase 1 · 30% |
| M2 | Exam module complete | 6 May 2027 | F1-06 | Phase 1 · 20% |
| M3 | Phase 1 acceptance — EduLite 1.0 | 26 Aug 2027 | All F1-xx | Phase 1 · 20% |
| M4 | Mobile app in production | 2 Dec 2027 | F2-01 to F2-07 | — |
| M5 | Release 2.0 — EduPlus / EduPro sellable | 30 Dec 2027 | F2-08, F2-09, F2-17 (2.0) | Phase 2 · 30% |
| M5a | Statutory returns and board forms complete | 13 Apr 2028 | F2-11, F2-12 | Phase 2 · 20% |
| M6 | Phase 2 acceptance — Release 2.x | 22 Jun 2028 | All F2-xx | Phase 2 · 20% |
| M7 | Agent OS and four agents live | 17 Aug 2028 | F3-01, F3-02 (S38, S40), F3-03a–d | Phase 3 · 30% |
| M7a | Migration studio complete | 9 Nov 2028 | F3-06, F3-03i | Phase 3 · 20% |
| M8 | Phase 3 acceptance — Release 3.0 | 21 Dec 2028 | All F3-xx | Phase 3 · 20% |

## Sprint → feature matrix

| Sprint | Dates | Features touched |
|---|---|---|
| S0 | 13–24 Sep 2026 | F1-01, F1-02, F1-11, F1-16 |
| S1 | 27 Sep–8 Oct 2026 | F1-02 |
| S2 | 11–22 Oct 2026 | F1-03 |
| S3 | 25 Oct–5 Nov 2026 | F1-05, F1-02 (holiday calendar) |
| S4 | 8–19 Nov 2026 | F1-12, F1-05 (offline PWA) |
| S5 | 22 Nov–3 Dec 2026 | F1-07 |
| S6 | 6–17 Dec 2026 | F1-07, F1-04 (lite), F1-11 (ID cards), F1-12 |
| S7 | 20–31 Dec 2026 | F1-01, F1-15, F1-14, F1-10 → **M1** |
| S8 | 14–25 Mar 2027 | F1-06 |
| S9 | 28 Mar–8 Apr 2027 | F1-06 |
| S10 | 11–22 Apr 2027 | F1-06 |
| S11 | 25 Apr–6 May 2027 | F1-06, F1-12, F1-14 → **M2** |
| S12 | 9–20 May 2027 | F1-08 |
| S13 | 23 May–3 Jun 2027 | F1-10, F1-09 |
| S14 | 6–17 Jun 2027 | F1-11, F1-03 |
| S15 | 20 Jun–1 Jul 2027 | F1-13, F1-09, F2-08 (staff records) |
| S16 | 4–15 Jul 2027 | F1-04, F1-14, F1-15 |
| S17 | 18–29 Jul 2027 | F1-01, F1-16 |
| S18 | 1–12 Aug 2027 | F1-01, F1-17 |
| S19 | 15–26 Aug 2027 | F1-17 → **M3** |
| S20 | 29 Aug–9 Sep 2027 | F2-01 |
| S21 | 12–23 Sep 2027 | F2-02 |
| S22 | 26 Sep–7 Oct 2027 | F2-02, F2-01 |
| S23 | 10–21 Oct 2027 | F2-03, F2-15 |
| S24 | 24 Oct–4 Nov 2027 | F2-05 |
| S25 | 7–18 Nov 2027 | F2-06, F2-07 |
| S26 | 21 Nov–2 Dec 2027 | F2-04, F2-01 → **M4** |
| S27 | 5–16 Dec 2027 | F2-08 |
| S28 | 19–30 Dec 2027 | F2-09, F2-17, F2-01 → **M5** |
| S29 | 5–16 Mar 2028 | F2-10 |
| S30 | 19–30 Mar 2028 | F2-11 |
| S31 | 2–13 Apr 2028 | F2-11, F2-12 → **M5a** |
| S32 | 16–27 Apr 2028 | F2-13, F2-07 |
| S33 | 30 Apr–11 May 2028 | F2-14 |
| S34 | 14–25 May 2028 | F2-15, F2-16 |
| S35 | 28 May–8 Jun 2028 | F2-16 |
| S36 | 11–22 Jun 2028 | F2-17 → **M6** |
| S37 | 25 Jun–6 Jul 2028 | F3-01 |
| S38 | 9–20 Jul 2028 | F3-02 |
| S39 | 23 Jul–3 Aug 2028 | F3-03a, F3-03b, F3-04 |
| S40 | 6–17 Aug 2028 | F3-03c, F3-03d, F3-01, F3-02 → **M7** |
| S41 | 20–31 Aug 2028 | F3-03e, F3-04, F3-02 |
| S42 | 3–14 Sep 2028 | F3-05 |
| S43 | 17–28 Sep 2028 | F3-03f, F3-04 |
| S44 | 1–12 Oct 2028 | F3-03g, F3-03h, F3-04 |
| S45 | 15–26 Oct 2028 | F3-03i, F3-06 |
| S46 | 29 Oct–9 Nov 2028 | F3-06, F3-04, F3-03j → **M7a** |
| S47 | 12–23 Nov 2028 | F3-03k, F3-07 |
| S48 | 26 Nov–7 Dec 2028 | F3-03l, F3-07 |
| S49 | 10–21 Dec 2028 | F3-03l, F3-07, F3-08 → **M8** |
| S50 | 4–15 Mar 2029 | A-01, A-02 |
| S51 | 18–29 Mar 2029 | A-03, A-04 |
| S52 | 1–12 Apr 2029 | A-05 |

## Spec conventions

- **Feature ID** is stable; file names carry the ID so links survive renames of the title.
- **Sprint delivery** rows are copied from Part B of the source and are the traceable commitment.
- **Acceptance criteria** are derived only from the source text and Spec v2; anything invented is placed under *Open questions* instead.
- **Tier availability** follows business-plan-v2.md §6; where the source is silent it says so.
