# Ontek EduSmart — Business Plan v2

*Agent-native school & college ERP for Bangladesh.*
*Revised 4 September 2026. Changes from v1 are listed in Appendix A; verification of every external figure is in Appendix B.*

---

## 1. Executive summary

Bangladesh has 21,086 secondary schools (93.7% privately run), roughly 4,450 colleges, and about 9,200 Alia madrasahs, together administering more than 15 million students on paper registers, Excel, and a fragmented set of local software vendors. Those vendors — School360, Bidyaan, Smart Educare, a dozen regional players, and a long tail of "pay once, self-hosted" scripts — sell near-identical feature lists at ৳8–25 per student per month, or as a one-time licence around ৳30,000. Several now use the word "AI" in their marketing. None of them has agents that do work.

We build the same table-stakes ERP properly, and then make it **agent-native**: every module carries agents that watch, draft, reconcile, and propose, with a human approving before anything leaves the building. The head teacher opens the app in the morning and reads what changed, what needs a decision, and what the system has already prepared for him — in Bangla.

Three things make this defensible for longer than a feature:

1. **Grading rules as versioned data.** NCTB has changed assessment twice in three years and has already published a revised marks distribution effective from the 2027 SSC. Competitors hardcode and patch; we version per academic year and reprint any historical result correctly.
2. **An agent operating layer, not a chatbot.** Agents have scoped permissions, tool access, cost budgets, memory, evaluation, and an approval queue. This is infrastructure, and it takes a team that has built it before roughly a year to replicate.
3. **Migration as a paid, agent-assisted product.** A register-digitisation agent reads photographed ledgers and Excel exports, proposes structured records, and a human verifies. Onboarding drops from two weeks to four days, becomes a profit line, and creates the switching cost that keeps institutions for a decade.

**New since v1:** the Personal Data Protection Act 2026 is now law, with penalties up to 5% of turnover. We handle children's data. Compliance is a design constraint and a sales advantage against incumbents who have never thought about it.

Targets: 45 institutions in year one, 220 in year two, 650 by end of year three; ৳4.7 lakh MRR at month 36; contribution-positive from month 14.

---

## 2. Market

### Verified size

| Segment | Institutions | Students | Source |
|---|---|---|---|
| Secondary schools | 21,086 (19,757 private, 691 govt, 638 upgraded primary) | 9,405,785 (2.93M urban, 6.48M rural) | BANBEIS, latest published |
| Colleges / higher secondary | ~4,450 (≈85% private) | ~3.5M (estimate) | BANBEIS via secondary sources |
| Alia madrasahs (Dakhil–Kamil) | ~9,200 | ~2.76M (54% girls) | BANBEIS 2023 draft |
| Technical & vocational | Growing; government priority | — | BANBEIS |

The college student figure and madrasah institution count are the two numbers still resting on secondary sources; pull them from the BANBEIS annual report directly before an investor version.

**TAM** — ~35,000 addressable institutions. At 450 students and ৳16/student/month, roughly ৳2,500 crore/year theoretical.
**SAM** — private secondary schools and colleges with 250+ students in district and upazila towns, already paying for SMS: 12,000–14,000 institutions.
**SOM (36 months)** — 650 institutions, ≈5% of SAM.

### A fact that shapes the whole go-to-market

Of 9.4 million secondary students, 6.48 million are rural, yet of 691 government secondary schools only 52 are rural. The rural market is almost entirely private, almost entirely underserved by software, and almost entirely on unreliable connectivity. **Offline-first is not a nice-to-have; it is the entry ticket to two-thirds of the market.**

### Segments in order of attack

1. Urban private schools & colleges, 400–2,000 students — primary. Money, competitive pressure, guardian demand, one decision-maker.
2. Rural non-govt secondary schools, 150–400 students — the volume market, once the offline mobile app is solid.
3. Colleges — land five as reference accounts; complex (departments, Class XI admission), high value.
4. Alia madrasahs — underserved, needs Dakhil/Alim structures; year-two wedge.
5. English-medium and cadet-style — different product; ignore for now.
6. Government institutions — tender-driven; ignore in years 1–2.

---

## 3. Problem

In a typical 600-student non-government school:

- Attendance is a paper register. Monthly percentages are reconstructed when the stipend form is due.
- Fees go into a hardbound ledger. The due list is compiled by hand and is always wrong.
- Marks are typed into Excel by one person after the exam. Tabulation takes two to three weeks. The 4th-subject rule is applied inconsistently. Merit position is contested.
- Guardians hear nothing until the result sheet is pinned to the wall.
- BANBEIS and DSHE returns are refilled from scratch every year.
- The head has no live number in front of him — not collection, not attendance, not who is about to fail.

Existing software digitises the entry and leaves the reading to the human. That is the gap.

---

## 4. Competition

### Named landscape (as visible September 2026)

| Vendor type | Examples | Model | Where they win | Where they lose |
|---|---|---|---|---|
| Established cloud ERPs | School360 (Spate Initiative), Smart Educare (Nextzen), Bidyaan | Per-student or per-institution subscription | Breadth, testimonials, biometric integrations, online payment | Dashboard-era UI, no offline, "AI" is a chatbot or a label, curriculum changes take months |
| Regional/local vendors | Dozens, district-level | Annual licence + relationship | The salesman knows the headmaster | Single-developer risk, no mobile, no support depth |
| Self-hosted scripts | "Pay once, never pay monthly" packages ~৳30,000 | One-time licence | Price anchor | No updates, no support, no SMS gateway, no compliance |
| Notification-only vendors | SMS/app vendors | Per-SMS | Cheap entry | Not an ERP; the incumbent we displace most often |
| Foreign/generic ERPs | Fedena-style, OSS forks | Varied | Feature depth | Cannot produce a BD tabulation sheet, Bangla testimonial, or BANBEIS return |

**The "pay once" anchor is the most dangerous competitor**, not the best one. A headmaster comparing ৳30,000 once against ৳7,200 a month needs to see, in the demo, what the monthly buys: agents that work every night, SMS that actually sends, results that survive an NCTB change, and someone to call. Price the annual prepay so the first-year total is visibly close to the "pay once" figure.

### Defensibility, honestly

| Advantage | Time to copy | Note |
|---|---|---|
| Versioned grading rules engine | 6–12 months | Requires rewriting their exam module |
| Agent operating layer (permissions, approvals, evals, cost control) | 12–18 months | Infrastructure; needs skills local teams mostly lack |
| Offline-first attendance and marks | 6–9 months | Painful to retrofit into a web-only stack |
| PDPA-compliant consent, audit, and data handling | 6 months | Nobody has started; being first is a sales line |
| Agent-assisted migration | Operational | Hardest to copy; it's a playbook plus a tool |
| Bangla-first output that prints correctly | Cheap to copy, expensive to retrofit | — |

The durable moats remain **switching cost** and **operational excellence in onboarding**. Everything else buys time.

---

## 5. Positioning

> ইনস্টিটিউশন চালানোর সফটওয়্যার নয় — ইনস্টিটিউশন চালাতে সাহায্য করার সফটওয়্যার।
> *Software that doesn't just record the school year — it tells the head what is going wrong while there is still time to fix it, and has already prepared what to do about it.*

**Do not market "AI".** Every competitor's brochure now says AI. Market outcomes in Bangla — ফলাফল বিশ্লেষণ, ঝুঁকিপূর্ণ শিক্ষার্থী চিহ্নিতকরণ, বকেয়া আদায় সহকারী, সকালের সারসংক্ষেপ. Demonstrate the agent doing work in the room.

**Do not claim "first" until legal has checked it.** "First agent-native ERP in Bangladesh" is a defensible claim only if defined precisely (agents with scoped permissions, approval queues, and autonomous scheduled work). Competitors already use "AI-powered". Define the term, own the definition, and be able to show the difference in eight minutes.

---

## 6. Packaging and pricing

Per active student, per month, billed to the institution. Say so on every page of collateral.

| | **EduLite** ৳10 | **EduPlus** ৳18 | **EduPro** ৳30 |
|---|---|---|---|
| Minimum billable students | 250 | 250 | 400 |
| Who logs in | Office & admin | + all teachers, all guardians | + institute head, governing body |
| Student info, admission, attendance, exam & tabulation, fees, accounts, routine, homework, documents, website | ● | ● | ● |
| Teacher app, guardian app | — | ● | ● |
| Online fee collection (bKash / Nagad / Rocket / SSLCommerz) | — | ● | ● |
| Library, hostel, transport, inventory, payroll | — | ● | ● |
| **Ask-your-data** in Bangla | — | ● | ● |
| **Agent suite** | Result analysis only (on publish) | 8 standard agents, 200 credits/month | All agents, custom workflows, 1,500 credits/month |
| Head's daily brief & approvals app | — | — | ● |
| Register-digitisation agent for migration | paid add-on | included in setup | included in setup |
| SMS included | none (at cost) | 2/student/month | 6/student/month |
| WhatsApp channel | — | — | ● |
| Support | Ticket + phone, business hours | Call centre 24/7 | Named account manager; on-site for 2,000+ |

The ladder is **access and absorption** — who gets in, and how much cost we eat — not a longer feature list.

### One-time and metered

| Item | Price | Notes |
|---|---|---|
| Setup & migration | ৳15,000 / ৳25,000 / ৳40,000+ by size | Non-negotiable. Agent-assisted register digitisation, last year's marks and dues, staff records, training, verification day. |
| SMS packs | Stated per-SMS rate above gateway cost | Balance visible in-app; never bill retroactively |
| Agent credits | Packs of 500 / 2,000 | 1 credit ≈ one agent run or one generated document; heavy jobs (script scanning) priced per page |
| Biometric device + install | Cost + margin | Attendance adoption doubles with a device |
| Custom domain + website hosting | Annual | Small, sticky |
| Extra training visit | Per visit | — |

### Pricing discipline

- Never discount the per-student rate; discount setup or give free months.
- Annual prepay: two months free. Position the first-year total against the "pay once" anchor.
- Sign November–January so migration happens once, with the new roll.

---

## 7. Unit economics

Average institution 450 students, blended ৳16/student/month.

| Per institution, monthly | ৳ |
|---|---|
| Subscription | 7,200 |
| SMS margin | 150 |
| Agent credit top-ups (≈8%) | 580 |
| **Gross revenue** | **7,930** |
| Cloud, storage, backups | 320 |
| SMS gateway | 600 |
| Model inference (capped, cached, small models for routine work) | 450 |
| Payment gateway share | 180 |
| Support & account management (allocated) | 1,100 |
| **Contribution** | **~5,280 (67%)** |

CAC ৳12,000–18,000 in year one via field sales; the setup fee covers it on signing. Subscription-only payback ≈ 3 months.

Churn: 8%/year after the first complete exam cycle; ~25% for institutions that never reach it. **Activation = attendance taken for 80% of classes on 10 consecutive working days + one full fee cycle in-system.** The first published result is the retention event.

**Inference is the only cost that scales with usage.** Cap credits per tier, cache every analysis by (exam, class) key, route routine generation (remarks, SMS drafts) to small models, reserve frontier models for analysis and free-form questions. Budget ৳450/institution/month at plan; alarm at ৳700.

---

## 8. Three-year projection

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Institutions (end) | 45 | 220 | 650 |
| Students managed | ~20,000 | ~99,000 | ~292,000 |
| MRR (end) | ৳3.2 lakh | ৳15.8 lakh | ৳46.8 lakh |
| Subscription revenue | ৳17 lakh | ৳96 lakh | ৳310 lakh |
| Setup & migration | ৳11 lakh | ৳44 lakh | ৳108 lakh |
| Metered & hardware | ৳4 lakh | ৳22 lakh | ৳72 lakh |
| **Revenue** | **৳32 lakh** | **৳162 lakh** | **৳490 lakh** |
| Team | 9 | 22 | 48 |
| Payroll | ৳43 lakh | ৳110 lakh | ৳245 lakh |
| Infra, inference, SMS COGS | ৳7 lakh | ৳30 lakh | ৳85 lakh |
| Sales, travel, marketing | ৳9 lakh | ৳30 lakh | ৳70 lakh |
| Compliance & legal (new) | ৳3 lakh | ৳5 lakh | ৳8 lakh |
| **EBITDA** | **(৳30 lakh)** | **(৳13 lakh)** | **৳82 lakh** |

Capital to month 20: ৳45–55 lakh assuming setup fees collected on signing. The sensitivity that matters is institutions closed per salesperson per month: planned 2.5, breakeven slips two quarters at 1.5.

These projections are assumptions, not verified figures. They are internally consistent; they are not evidence.

---

## 9. Go to market

### District ladder
One district at a time; inside it, one upazila at a time. Anchor account → reference selling → density → next district. Rajshahi first (home ground, dense, low saturation), then Bogura, Rangpur, Pabna, Sirajganj. Dhaka in year two with named references.

### Channels
Direct field sales (seller + onboarding specialist per region) → local reseller/agent network in year two (commission on setup + 10% recurring for 24 months) → governing body members who sit on several institutions → head teachers' associations → district Facebook for leads only → **existing customers as the largest channel by year two** (one month free for both parties).

### The eight-minute demo
1. Attendance on a phone → guardian SMS fires in the room.
2. Marks for one subject → tabulation and merit list instantly.
3. One tap → class analysis names the two weakest subjects with numbers, in Bangla.
4. One tap → a report-card remark for a named student.
5. **New:** photograph a page of their own fee register → the migration agent proposes structured entries → they watch us verify three rows.
6. Head's morning brief: what changed overnight, what needs a decision, what has been prepared.

Steps 3–6 cannot be shown by anyone else in the room.

### Seasonality
Sept–Oct prospecting · **Nov–Jan signing and migration** · Feb–Apr adoption · **May–Jun first exam cycle, all hands on support** · Jul–Aug upgrades and hardware.

---

## 10. Onboarding & migration playbook

Day 0–2 discovery (student list, staff, class/subject structure, fee heads, last marks, dues, letterhead, seal, EIIN, SMS sender-ID paperwork, **guardian consent notices**).
Day 3–5 **agent-assisted migration**: photograph registers, upload Excel; the digitisation agent proposes records; our onboarding specialist verifies and imports. We never ask the institution to do this.
Day 6 **verification day**, on-site: print last term's tabulation from our system beside theirs. They must match exactly.
Day 7–10 training: office, teachers, head. Bangla materials, printed cheat sheets, WhatsApp group.
Day 11–30 hand-holding, daily usage watch, direct calls to teachers who stop taking attendance.

---

## 11. Compliance — new section

The **Personal Data Protection Act 2026 (Law 63 of 2026)** passed Parliament in April 2026, replacing the November 2025 ordinance. Penalties reach 5% of annual turnover. Localisation mandates were narrowed to critical sectors (banking, healthcare), and criminal liability for officers was removed. It applies extraterritorially to anyone processing data of people in Bangladesh. Implementing rules and the data-classification schedule are still being issued.

We process children's personal data, guardian contact data, and financial records. Design consequences:

- **Consent.** Guardian consent captured at admission and on migration, per purpose (SMS, app, AI processing, photo use), stored with timestamp and version. A consent and privacy centre in the product.
- **Data minimisation.** Collect what the board and stipend forms require; nothing else by default.
- **Cross-border processing.** Model inference may leave the country. Until the classification schedule is published, treat student academic and financial records as potentially "confidential": pseudonymise before inference (roll numbers, not names, unless the output requires a name), keep raw records in-country, and keep a switch to route inference to an in-country or self-hosted model if the schedule demands it.
- **Data subject rights.** Export, correction, and deletion flows for a student's record, with legal-hold exceptions for published results.
- **Audit.** Every read of a student's full record by a human is logged, not just writes.
- **Breach process.** Named data protection officer, 72-hour internal escalation, template notices in Bangla.
- **Vendor terms.** SMS gateways and payment providers bound by data-processing agreements.

Budget ৳3 lakh in year one for legal review and a part-time DPO. **Sell this**: "PDPA-ready" on the proposal, one paragraph in Bangla explaining what it means for the institution's own liability. No incumbent can say it yet.

---

## 12. Product roadmap

**Phase 1 — Months 1–5, sellable core.** Multi-tenancy, entitlements, metering. Student info, admission, attendance (web, offline mobile, device sync), fees, accounts, exam and tabulation with versioned rules, report cards, certificates, SMS, website. Agent operating layer v1 with four agents: result analysis, remark writer, fee reminder, attendance watch. Approval queue. Consent capture.

**Phase 2 — Months 6–9, adoption.** Teacher, guardian, head apps. Routine builder. Homework and assignments. Online fees. Ask-your-data. Morning brief. Register-digitisation agent. Command bar.

**Phase 3 — Months 10–14, depth.** Library, hostel, transport, inventory, payroll and PF, leave, BANBEIS/DSHE exports, board form fill-up, workflow builder, WhatsApp channel, question-paper studio v1.

**Phase 4 — Year 2, differentiation.** Madrasah and technical variants, answer-script scanning assist, dropout-risk model trained on our own data, reseller portal, Class XI admission, governing body portal, alumni.

---

## 13. Team

**Year 1 (9):** founder/product · 2 backend · 2 frontend (one mobile-strong) · 1 designer · 1 QA/support lead · 2 field (sales, onboarding).
**Year 2 (to 22):** +2 backend, +1 mobile, **+1 AI/agent engineer**, +4 support/onboarding, +4 field sales, +1 finance/admin, part-time DPO.

Hire the onboarding specialist before the second salesperson.

---

## 14. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| NCTB assessment changes (2027 SSC distribution already announced) | High | Rules as versioned data; market it |
| "Pay once" price anchor | High | Annual-prepay framing; demo what monthly buys; never match |
| PDPA enforcement, unclear classification schedule | High | Pseudonymised inference, in-country raw data, model-routing switch, consent centre, DPO |
| Inference cost overrun | Medium | Credit caps, caching, model routing, alarms |
| Agent sends wrong message at scale | High reputational | Approval queue default; rate limits; per-guardian frequency caps; kill switch |
| Failed onboarding → early churn | High | Activation definition, verification day, 30-day watch |
| Rural connectivity | High for segment 2 | Offline-first mobile with conflict-safe sync |
| Data breach | Severe | RLS, encrypted at rest, tested restores, read-audit, DPO |
| Gateway failure during results week | Medium | Dual SMS gateways, queue and retry |
| Founder-dependent sales | Medium | Scripted demo, pricing rules, from first hire |
| Competitor ships "agents" in name only and confuses the market | Medium | Own the definition; show the approval queue and the audit log in every demo |

---

## 15. Metrics

Weekly: demos, proposals, signings, activation pipeline, tickets per institution, **agent approvals pending > 48h**.
Monthly: MRR, ARPU, activations, attendance-taking rate per institution, credits used vs allocated, inference cost per institution, **agent proposals accepted vs rejected** (a rejected-rate above 30% means an agent is badly tuned).
Quarterly: logo churn, NRR, CAC payback, district density, referral share, consent coverage %.

**The one number:** share of institutions where teachers took attendance on 4 of the last 5 school days. Below 70% for an institution, it churns at renewal.

---

## Appendix A — Changes from v1

| Area | v1 | v2 | Why |
|---|---|---|---|
| Compliance | One risk-table row | Full section, DPO in team, ৳3 lakh budget, product features | PDPA 2026 passed in April; 5% turnover penalties |
| Competitors | Generic types | Named vendors and the "pay once" anchor | Verified by search |
| Positioning | "AI layer" | "Agent-native"; explicit rule against marketing "AI" | Every competitor now says AI |
| Rural market | Mentioned | Quantified (6.48M rural students, 52 rural govt schools); offline-first elevated to entry ticket | BANBEIS figures |
| Migration | Manual playbook | Agent-assisted digitisation, in demo step 5 | Product enhancement; shortens onboarding to ~6 days |
| Inference cost | ৳400 | ৳450 with model routing and caching described | More agents in scope |
| EBITDA | (26)/(6)/93 | (30)/(13)/82 | Compliance cost, AI engineer hire |
| Metrics | — | Agent acceptance rate, approvals ageing, consent coverage | Agent-native operations |

## Appendix B — Verification log (4 Sep 2026)

| Claim | Status | Source |
|---|---|---|
| 21,086 secondary schools; 19,757 private; 691 govt; 638 upgraded primary | **Verified** | BANBEIS via Bonik Barta |
| 9,405,785 secondary students; 2,926,849 urban / 6,478,936 rural | **Verified** | BANBEIS via Bonik Barta |
| ~4,450 colleges, ≈85% private | **Verified (secondary source)** | BANBEIS via ResearchGate summary |
| ~2.76M madrasah students, 54% girls | **Verified** | BANBEIS 2023 draft via Prothom Alo |
| ~9,200 Alia madrasahs | **Unverified** — from prior knowledge; check BANBEIS table B4 | — |
| GPA scale A+ 5.00 … F 0; 4th subject bonus above 2.00 | **Verified** | Multiple SSC 2026 sources |
| Classes IX–X assessment based on 2012 curriculum from 2025 session | **Verified** | NCTB |
| Revised SSC marks distribution effective from 2027 exam | **Verified** | NCTB |
| PDPA 2026 passed April 2026; 5% turnover penalty; localisation narrowed; extraterritorial | **Verified** | Securiti, TBS, CCIA |
| Named competitors and "pay once ~৳30,000" anchor | **Verified** | Vendor sites, BDStall |
| Competitor per-student prices ৳8–25 | **Partly verified** — vendors don't publish; from market conversations | — |
| All financial projections, CAC, churn, inference cost | **Assumptions** — internally consistent, not evidence | — |
