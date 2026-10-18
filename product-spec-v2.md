# Ontek EduSmart — Product Specification v2

*Agent-native school & college ERP. Revised 4 September 2026.*

What changed from v1: an agent operating layer (§3) that every page plugs into; each page now specifies **user actions**, **agent actions**, and **events** it emits; eleven new pages (§6); a consent and privacy centre for PDPA 2026; offline-first elevated to a hard requirement; mobile apps rewritten around voice and camera.

---

## 1. The design principle

Every page has three layers, always in this order of importance:

1. **The record** — the truth, editable by humans with the right role.
2. **The actions** — what a human can do to it.
3. **The agent** — what the system has already noticed, prepared, or proposes, waiting for a human to accept.

The agent layer never bypasses the actions layer. An agent proposes; a human or an explicitly-granted policy accepts; a service executes. The model is never given a database connection.

A page that has nothing for the agent to say shows nothing. Silence is a feature. An agent that talks on every page trains people to ignore it.

---

## 2. Roles and principals

| Role | Scope | Person |
|---|---|---|
| Platform Admin | All tenants | Us |
| Institute Head | One institution | Headmaster / Principal |
| Admin Officer | One institution | Office secretary, head clerk |
| Accountant | Finance | Cashier / accounts officer |
| Exam Controller | Exam | Assistant head |
| Class Teacher | Own section + subjects | — |
| Subject Teacher | Own subjects | — |
| Librarian / Store / Transport / Hostel | Own module | Staff |
| HR Officer | Staff records, payroll prep | — |
| Data Protection Contact | Consent, access requests, audit | Usually the Admin Officer |
| Student | Own record | — |
| Guardian | Own children | — |
| Committee Member | Read-only summaries | Governing body |
| **Agent (principal)** | Scoped by the agent's definition | Not a person |

Agents are first-class principals. Each agent holds a token scoped to specific tools, specific data (e.g. "attendance and enrolment for the current session, this institution"), and a credit budget. Permission checks treat an agent exactly like a user with that role — RLS at the database, then role, then assignment.

---

## 3. Agent operating layer

### 3.1 Anatomy of an agent

| Field | Meaning |
|---|---|
| Name, description (Bangla + English) | Shown to the institution |
| Trigger | Schedule (cron), event (`result.published`), or manual |
| Scope | Which data it may read: modules, classes, sessions |
| Tools | Which service functions it may call (read-only tools vs proposing tools) |
| Output type | Insight (read-only) · Draft (needs approval) · Action (executes under policy) |
| Approval policy | Always · Batch · Auto with limits · Auto |
| Limits | Max items per run, per-recipient frequency cap, credit ceiling per run |
| Memory | What it may remember between runs (e.g. "already flagged roll 17 on 2 Sep") |
| Model tier | Small / standard / frontier — set per agent, overridable per tenant |
| Owner | Which role receives its output |
| Kill switch | Head or Platform Admin can pause any agent instantly |

### 3.2 Tools

Agents call typed service functions, never SQL. Two classes:

- **Read tools** — `attendance.summary`, `fees.dues`, `exam.tabulation`, `students.search`. Return pre-aggregated, permission-filtered data. Pseudonymised by default (roll + section, not name) unless the tool is invoked with `needs_names=true` and the agent's scope allows it.
- **Propose tools** — `sms.draft_batch`, `remark.propose`, `flag.create`, `record.propose_change`, `report.generate`. Each writes a proposal, not a mutation. A proposal becomes a mutation only through the approval queue or a policy.

There is no `execute` tool exposed to the model.

### 3.3 Approval queue

Central inbox for everything agents propose. Batches, per-item editing, skip, approve, reject with reason. Approval policies:

| Policy | Meaning | Default for |
|---|---|---|
| Always | Every batch reviewed by a human | Outbound messages, marks, money |
| Batch | Human reviews the batch once; individual items pre-checked | Report-card remarks |
| Auto with limits | Executes if under N items and no anomaly flags | Attendance-risk flags to teachers |
| Auto | Executes | Internal insights, cache refresh |

Only the Institute Head can loosen a policy; the change is audited and visible on the agent's card forever.

### 3.4 Memory

Per-institution, per-agent, structured — not a chat log. Examples: which students were already flagged and when; which guardians were messaged this week; last analysis per exam. Memory is inspectable and clearable from the agent's page.

### 3.5 Evaluation

Every proposal records whether it was accepted, edited, skipped, or rejected, and by whom. Per-agent acceptance rate is shown on the agent console. A rate under 70% raises a platform-side alert — the agent is badly tuned for that institution. Edited text is retained (with consent) to improve templates.

### 3.6 Cost

Every run debits credits and records model, tokens, and taka cost. Institution sees credits; we see margin. Analysis outputs cached by `(institution, exam, class, rule_set_version)` — regenerated only when inputs change.

### 3.7 Degraded modes

- **No credits** — agents pause; pages still work; a quiet banner offers a top-up.
- **Model unavailable** — proposals queue; nothing is lost; the approval queue shows "waiting".
- **Offline device** — no agent features; attendance and marks entry still work and sync later.
- **Compliance switch** — inference routed to in-country/self-hosted model if the PDPA classification schedule requires it. Same tools, same prompts, lower quality, still working.

### 3.8 Standard agents (shipped)

| Agent | Trigger | Reads | Proposes | Policy |
|---|---|---|---|---|
| Morning brief | 06:30 daily | Yesterday's attendance, collection, approvals, flags | 3-sentence Bangla brief per head | Auto (read-only) |
| Attendance watch | 16:00 daily | Attendance, last 30 days | Flags to class teachers; draft absence SMS | Auto with limits / Always |
| Fee reminder | 10:00 daily | Dues, payment history | Draft SMS batch | Always |
| Result analysis | `result.published` | Tabulation, previous exams | Class analysis; weak-topic report per subject teacher | Auto (read-only) |
| Remark writer | `result.published` | Per-student marks, attendance, previous remarks | Bangla remark per report card | Batch |
| Dropout risk | Weekly | Attendance, results, fee irregularity, age | Ranked risk list with reasons; suggested intervention | Auto with limits |
| Routine repair | `leave.approved` | Routine, teacher availability | Substitute assignment proposal | Always |
| Collection reconciliation | Counter close | Receipts, online payments, bank slips | Discrepancy list | Auto (read-only) |
| Register digitiser | Manual (migration) | Uploaded photos/Excel | Structured records with confidence | Always |
| Compliance monitor | Weekly | Consent coverage, access logs, retention | Gaps and expiring consents | Auto (read-only) |
| Statutory return prep | Calendar | Whole institution | Pre-filled BANBEIS/DSHE forms with unknowns highlighted | Always |
| Question paper drafter | Manual | Syllabus, question bank, past papers | Draft paper by marks distribution | Always |

---

## 4. Global shell

```
┌────────────────────────────────────────────────────────────────────┐
│ [≡] রাজশাহী মডেল স্কুল ও কলেজ   [Session 2026 ▾] [Shift: Day ▾]    │
│    [⌘K  Ask or do anything… ]   [Approvals 6] [🔔] [বাং|EN] [👤 ▾]  │
├──────────────┬─────────────────────────────────────────────────────┤
│ Today        │                                                     │
│ Students     │                  PAGE CONTENT                       │
│ Admission    │                                                     │
│ Attendance   │   ┌── Agent tray (collapsible, right edge) ───┐    │
│ Exam         │   │ ⚑ 4 classes haven't taken attendance      │    │
│ Fees         │   │ ✎ 38 fee reminders drafted — review       │    │
│ Accounts     │   └───────────────────────────────────────────┘    │
│ Routine      │                                                     │
│ Academics    │                                                     │
│ Communication│                                                     │
│ Operations ▸ │  (library, hostel, transport, inventory)            │
│ People ▸     │  (staff, payroll, leave)                            │
│ Reports      │                                                     │
│ Agents       │                                                     │
│ Settings     │                                                     │
└──────────────┴─────────────────────────────────────────────────────┘
```

**Persistent controls**
- **Command bar (⌘K / long-press on mobile)** — natural-language in Bangla or English. Two modes auto-detected: *ask* ("কোন ক্লাসে আজ উপস্থিতি সবচেয়ে কম?") returns an answer with source rows; *do* ("IX-A র বকেয়া তালিকা প্রিন্ট করো") opens the right page with filters applied, or drafts a proposal into the approval queue. Never executes a mutation directly.
- **Approvals badge** — the agent inbox count. Always visible for roles that approve.
- **Agent tray** — page-contextual proposals. Empty by default.
- **Session / shift selectors** — non-current sessions are read-only with a coloured header.
- **Language toggle** — per user.
- Menu items not entitled by tier are hidden, never greyed.

---

## 5. Page inventory

Bold = new in v2.

| Module | Page | Route | Roles |
|---|---|---|---|
| Today | Head's today | `/today` | Head, Committee |
| | Teacher's today | `/today` | Teachers |
| | Office today | `/today` | Admin, Accountant |
| | **Morning brief** | `/today/brief` | Head |
| Students | List · Profile · Add/Edit · Bulk import · Promotion · Exit | `/students…` | Admin, Head |
| | **Student 360 timeline** | `/students/:id/timeline` | Class Teacher, Head |
| Admission | Public form · Applications · Test & merit · Allocation | `/admission…` | Admin |
| | **Admissions CRM (enquiries, follow-ups)** | `/admission/enquiries` | Admin |
| Attendance | Take · Register · Monthly & stipend · Devices · Staff · Leave | `/attendance…` | — |
| Exam | Setup · Rules · Entry · Status board · Tabulation · Report · Publish · Admit & seat · Board forms | `/exam…` | — |
| | **Question paper studio** | `/exam/papers` | Subject Teacher, Exam Controller |
| | **Answer-script assist** | `/exam/:id/scripts` | Subject Teacher |
| | **Result analytics** | `/exam/:id/analytics` | Head, Exam Controller |
| Fees | Collect · Structure · Dues · Ledger · Waivers · Online log | `/fees…` | — |
| | **Counter close & reconciliation** | `/fees/close` | Accountant |
| Accounts | Vouchers · Ledger · Reports · Budget | `/accounts…` | — |
| Routine | Builder · Substitute · Workload | `/routine…` | — |
| Academics | Homework · Syllabus & lesson plans · Materials · Notices | `/academics…` | — |
| Communication | SMS composer · Log & balance · **WhatsApp channel** · **Guardian inbox** | `/comm…` | Admin |
| Operations | Library · Hostel · Transport · Inventory | `/ops…` | — |
| People | Staff · Payroll · Service record · Leave · **Recruitment** | `/people…` | — |
| Reports | Report centre · Statutory returns · **Custom report builder** | `/reports…` | — |
| Agents | **Console** · **Approval queue** · **Workflow builder** · **Run history** · **Credits** | `/agents…` | Head, Admin |
| Governance | **Committee portal** | `/governance` | Committee, Head |
| Data | **Migration studio** · **Consent & privacy centre** · **Access requests** · **Integrations hub** | `/data…` | Admin, DPC |
| Settings | Institution · Academic structure · Users & roles · Billing · Audit log · **Document templates** | `/settings…` | Head, Admin |

Platform side: tenants · tenant health · onboarding pipeline · billing · usage & margin · support · entitlements · **agent tuning** (per-tenant acceptance rates, prompt overrides).

---

## 6. Page specifications

Each page: layout, **User actions**, **Agent actions** (what agents surface or propose here), **Events** (what the page emits for agents and integrations).

---

### 6.1 Head's today — `/today`

```
┌────────────────────────────────────────────────────────────────────┐
│  শুক্রবার, ৪ সেপ্টেম্বর ২০২৬                                        │
│                                                                    │
│  ┌─ MORNING BRIEF ──────────────────────────────────────────────┐  │
│  │ গতকাল উপস্থিতি ৮৭.৪%, আগের বৃহস্পতিবারের চেয়ে ৩% কম — মূলত  │  │
│  │ সপ্তম-খ শ্রেণিতে। আদায় ৳১,২৪,৫০০, মাসের লক্ষ্যের ৬৬%। আপনার  │  │
│  │ অনুমোদনের অপেক্ষায় ৬টি বিষয়, যার ২টি আজই দরকার।      [full] │  │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─ NEEDS A DECISION ───────────────────────────────────────────┐  │
│  │ ✎ 38 fee reminder SMS drafted           [review & send]       │  │
│  │ ✎ Substitute for Md. Anis (on leave Sat) [approve]            │  │
│  │ ⚑ 6 students flagged dropout-risk        [see who & why]      │  │
│  │ ⚑ Waiver request: roll 22, IX-B, ৳600   [decide]              │  │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─ TODAY ──────────────────────────────────────────────────────┐  │
│  │ Attendance 87.4% ▁▃▅▆▇  Collection ৳1,24,500  Absent staff 3  │  │
│  │ 4 classes not yet taken → [remind]                            │  │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌─ Collection vs target ──┐ ┌─ Upcoming ─────────────────────┐    │
│  │ ▇▇▅▇▇▆  Sep 66%          │ │ 08 Sep Half-yearly result      │    │
│  └──────────────────────────┘ │ 12 Sep Governing body meeting  │    │
│                               └────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** open any item → filtered page, never a modal · remind teachers (shows count first) · approve/decide inline for single-item proposals · change date/shift.
**Agent actions:** morning brief (read-only) · decision list assembled from the approval queue and flags, ranked by urgency and deadline · "why" explanation on every flag with source rows.
**Events:** `head.viewed_brief`, `flag.acknowledged`.

---

### 6.2 Teacher's today — `/today`

```
┌────────────────────────────────────────────────────────────────────┐
│  Good morning, Rezaul Karim sir                                    │
│  ┌─ YOUR CLASSES ───────────────────────────────────────────────┐  │
│  │ 1st 09:00 IX-A Physics   [take attendance]   ○ not taken      │  │
│  │ 3rd 11:00 X-B  Physics   [take attendance]   ○ not taken      │  │
│  │ 5th 13:00 IX-B Physics   ✓ 42/46  [edit]                      │  │
│  │ 6th 14:00 VIII-A ICT (substitute for Md. Anis)  [take]        │  │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌─ PENDING FROM YOU ───────────────────────────────────────────┐  │
│  │ Marks · Half-yearly · Physics IX-A   12/46   [continue]       │  │
│  │ Homework for X-B tomorrow — draft ready ✎     [review & set]  │  │
│  │ 4 assignment submissions   [check]                            │  │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌─ STUDENTS TO WATCH ──────────────────────────────────────────┐  │
│  │ Roll 17 সুমাইয়া · absent 6 of last 10 · SMS drafted ✎ [send] │  │
│  │ Roll 31 ইমরান · Physics A- → D · practical 6/25  [see trend]  │  │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌─ FOR YOUR CLASS ─────────────────────────────────────────────┐  │
│  │ Half-yearly IX-A Physics: 7 of 9 fails were in the practical  │  │
│  │ component. Lab periods scheduled: 4 of 8 held.   [open]       │  │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** take/edit attendance · continue marks · review and set drafted homework · check submissions · send drafted guardian message (editable) · apply for leave · view routine.
**Agent actions:** homework draft from the lesson plan and syllabus position · absence SMS drafts · weak-topic insight for this teacher's subjects only · substitute-period reminders.
**Events:** `attendance.taken`, `homework.set`, `guardian.message_sent`.

---

### 6.3 Take attendance — `/attendance/take` (mobile-first)

```
┌──────────────────────────────┐
│ ← IX-A · Physics · 1st       │
│ 4 Sep 2026   ⟳ offline ready │
├──────────────────────────────┤
│ Present 44 · Absent 2 · Late 0│
│ [All present] [Copy yesterday]│
│ [🎤 বলে দিন]  [📷 Scan]       │
├──────────────────────────────┤
│  1 সাদিয়া ইসলাম     [P][A][L] │
│  2 রাফিদ হাসান       [P][A][L] │
│  4 তানভীর আহমেদ      [P][A][L] │
│    ↳ 5 of last 10 absent ⚠    │
│  …                            │
├──────────────────────────────┤
│ ☑ Notify guardians of absent  │
│     [ Save attendance ]       │
└──────────────────────────────┘
```

**User actions:** P/A/L per student · all present · copy yesterday · **voice**: "সতেরো, একত্রিশ অনুপস্থিত" marks rolls 17 and 31 absent, reads back for confirmation · **scan**: photo of a paper register page → proposed marks with confidence, teacher confirms · note per student · toggle guardian SMS · save (queues offline) · edit same day, locked after.
**Agent actions:** voice and scan interpretation · pattern warnings inline ("5 of last 10") · after save, absence SMS proposals to the approval queue (or auto, if the head enabled it with a daily cap).
**Events:** `attendance.taken`, `attendance.absent_flagged`.
**Rules:** only assigned periods on the current date; backdating requires Admin; every change audited.

---

### 6.4 Marks entry — `/exam/:id/entry`

```
┌────────────────────────────────────────────────────────────────────┐
│ Half-yearly 2026 · IX Science A         Status: ENTRY OPEN         │
│ Subject [পদার্থবিজ্ঞান ▾]                    32/46 complete        │
│ [📷 Scan mark sheet]  [⬆ Import Excel]  [Print blank sheet]        │
│ ──────────────────────────────────────────────────────────────────│
│ Roll Name                 CQ/50  MCQ/25  Prac/25  Tot  Grade       │
│  1   সাদিয়া ইসলাম         [ 41]  [ 22]  [ 23]    86    A+         │
│  3   নুসরাত জাহান          [ 12]  [  9]  [  6]    27    F          │
│  4   তানভীর আহমেদ          [ 33]  [ 19]  [  7]    59    F ᴾ        │
│  5   মেহজাবিন চৌধুরী       [   ]  [   ]  [   ]     —    —          │
│ ── Agent ─────────────────────────────────────────────────────── │
│ ⚠ Roll 9: MCQ 25/25 but CQ 11/50 — unusual spread, please check   │
│ ⚠ Roll 12: 38 entered, last term 82 — large drop, confirm         │
│                   [Save draft]      [Submit to exam controller]    │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** enter per component · absent · autosave · submit (locks subject) · request reopen · scan a handwritten mark sheet (proposals with confidence, cell-by-cell confirm) · import Excel · print blank sheet.
**Agent actions:** anomaly detection on entry (spread, drop vs previous, transposition patterns like 54↔45) · completion nudges to the exam controller · never changes a value.
**Events:** `marks.submitted`, `marks.anomaly_flagged`.

---

### 6.5 Marks entry status board — `/exam/:id/status`

```
┌────────────────────────────────────────────────────────────────────┐
│ Half-yearly 2026 · Entry status            Deadline 6 Sep, 2 days  │
│           IX-A   IX-B   X-A    X-B                                 │
│ Bangla    ✓      ✓      ✓      ◐ 30/44                             │
│ English   ✓      ✓      ◐      ○  not started  (Farida)            │
│ Physics   ◐ 32   ✓      ✓      ✓                                   │
│ …                                                                  │
│ ✎ Reminder drafted to 3 teachers behind schedule   [review & send] │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** reopen a subject · extend deadline · send reminder · open any cell.
**Agent actions:** reminder drafts · projected completion vs deadline.
**Events:** `exam.entry_complete`.

---

### 6.6 Tabulation sheet — `/exam/:id/tabulation`

As v1 (frozen roll/name columns, horizontal subject scroll, GPA and merit pinned right, fails in red, A4 landscape print).

**User actions:** print · export · filter · sort · cell → student marks · publish (Exam Controller) · analyse.
**Agent actions:** none on the sheet itself. The sheet is the record; the agent works on the analytics page. Deliberate.
**Events:** `tabulation.viewed`.

---

### 6.7 Result analytics — `/exam/:id/analytics` (new)

```
┌────────────────────────────────────────────────────────────────────┐
│ Half-yearly 2026 · IX Science A · Analytics      [Export] [Share]  │
│                                                                    │
│ ┌─ Class summary ──────────────┐ ┌─ vs Q1 ────────────────────┐    │
│ │ 46 appeared · 41 passed 89.1% │ │ Pass rate ▲ 3.2            │    │
│ │ Avg GPA 3.71 · GPA-5 ×6       │ │ Avg GPA ▼ 0.08             │    │
│ └───────────────────────────────┘ └────────────────────────────┘    │
│ ┌─ Subject heat ────────────────────────────────────────────────┐  │
│ │           avg%  fails  A+   trend                             │  │
│ │ Physics    52   9      2    ▼▼   ← practical: 7 of 9 fails    │  │
│ │ Math       61   4      8    ▬                                  │  │
│ │ Bangla     74   0     14    ▲                                  │  │
│ └───────────────────────────────────────────────────────────────┘  │
│ ┌─ Agent analysis (Bangla) ─────────────────────────────────────┐  │
│ │ পদার্থবিজ্ঞানে অকৃতকার্য ৯ জনের ৭ জনই ব্যবহারিকে ৩৩% এর নিচে…  │  │
│ │ [Send to Physics teacher] [Add to governing body report]      │  │
│ └───────────────────────────────────────────────────────────────┘  │
│ ┌─ Students needing attention ─────────────────────────────────┐   │
│ │ Roll 3 · 2 fails · attendance 61% · dues 3 months  [profile]  │   │
│ └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** compare with previous exam · filter by subject/section · send analysis to a teacher · add to committee report · export.
**Agent actions:** class analysis (cached per exam/class/rule version) · per-teacher weak-topic notes · at-risk ranking combining marks, attendance, dues · trend narrative.
**Events:** `analysis.shared`.

---

### 6.8 Publish result — `/exam/:id/publish`

As v1 checklist plus: **☑ Generate remarks (46) → batch review** and **☑ Queue result analysis**. Publishing freezes marks and the rule-set version. Head may unpublish within 24h with a logged reason.
**Events:** `result.published` — the trigger for remark writer, result analysis, result SMS, report-card PDFs.

---

### 6.9 Grading rules — `/exam/rules`

As v1 (bands, pass mark, separate practical/MCQ, F→GPA 0, 4th-subject floor, max GPA, locked once published against).
**New:** *Preview impact* — pick a past exam, see how many GPAs and positions would change under the edited rules before saving. *Import NCTB preset* — a curated rule set per board and year that we maintain (2026 SSC, 2027 SSC revised distribution, Dakhil), applied as a starting point.
**Agent actions:** when NCTB publishes a change we add a preset; the agent proposes "a new preset is available for session 2027" to the exam controller. Never auto-applies.

---

### 6.10 Question paper studio — `/exam/papers` (new)

```
┌────────────────────────────────────────────────────────────────────┐
│ New paper · Physics · Class IX · Half-yearly                       │
│ Distribution [NCTB 2026: CQ 50 · MCQ 25 ▾]   Chapters [1–5 ▾]      │
│ Difficulty  ▁▃▅ balanced        Bloom mix  [remember 30/apply 50/…]│
│ Source  ☑ Question bank (412)  ☑ Past papers  ☐ Generate new       │
│                                                [Draft paper ✎]    │
│ ── Draft ───────────────────────────────────────────────────────  │
│ সৃজনশীল ১. (উদ্দীপক) …                       ch.3 · apply · 10     │
│    ক) … (১)  খ) … (২)  গ) … (৩)  ঘ) … (৪)         [swap] [edit]    │
│ …                                                                  │
│ MCQ 1–25                                        [regenerate 5–8]   │
│ ── Checks ────────────────────────────────────────────────────── │
│ ✓ Marks total 75  ✓ Chapter coverage  ⚠ 2 questions used in 2025   │
│                  [Save to bank]  [Export DOCX]  [Print with header] │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** set distribution/chapters/difficulty · draft · swap or edit any item · regenerate a range · save to bank · export DOCX/PDF with letterhead · lock paper (sealed until exam date; only exam controller can open).
**Agent actions:** drafting from bank and syllabus · coverage and duplication checks · Bangla proofreading · answer key and marking rubric generation for CQ.
**Rules:** generated items are marked as such in the bank; teacher approval required before a paper is locked.

---

### 6.11 Answer-script assist — `/exam/:id/scripts` (new, Phase 4)

Upload or scan answer scripts (phone camera, batch). The agent applies the rubric to CQ answers and proposes marks per sub-question with highlighted evidence; the teacher confirms or adjusts per script. MCQ via OMR-style sheet recognition.
**User actions:** scan · review proposal script by script · adjust · accept · export marks to entry.
**Agent actions:** rubric-based proposals with confidence; flags illegible pages; never writes to marks entry without teacher acceptance.
**Rules:** priced per page; proposals expire if not reviewed within 14 days; scripts stored encrypted, deleted per retention policy.

---

### 6.12 Fee collection counter — `/fees/collect`

As v1 (search, selectable heads, partial payment, modes, waiver, collect & print, void with approval).
**Added:** *Promise to pay* with date · *Send bKash payment link* to guardian · *Scan bank slip* — photo of a deposit slip, agent proposes the amount, date, and reference for matching.
**Agent actions:** duplicate-payment warning · "guardian usually pays via bKash — send link?" · at counter close, reconciliation.
**Events:** `fee.collected`, `receipt.voided`.

---

### 6.13 Counter close & reconciliation — `/fees/close` (new)

```
┌────────────────────────────────────────────────────────────────────┐
│ Close counter 1 · 4 Sep 2026 · Md. Jalal                           │
│ Cash receipts  47   ৳ 1,24,500       Cash counted  [ 1,24,000 ]    │
│ bKash          12   ৳   14,400  ✓ matched to gateway               │
│ Bank slips      3   ৳    3,600  ⚠ 1 not yet in bank statement      │
│ ── Agent ───────────────────────────────────────────────────────── │
│ Shortage ৳500. Receipt #1042 (৳500, roll 11 X-B) was voided at     │
│ 13:40 and re-issued as #1043 — likely double count. [open both]    │
│                                  [Close counter]  [Print cash sheet]│
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** enter counted cash · resolve discrepancies · close (locks the day's receipts) · print tally.
**Agent actions:** reconciliation explanation with receipt links · pattern alerts across days (repeated small shortages) to the Head only.
**Events:** `counter.closed`.

---

### 6.14 Due list — `/fees/dues`

As v1. **Agent actions:** segments by payment behaviour (never late / occasionally / chronic) · reminder SMS drafts per segment with different tone · predicted collection this month · suggests which 20 calls the office should make in person. Everything outbound via the approval queue.

---

### 6.15 Student profile & 360 timeline — `/students/:id`, `/students/:id/timeline`

Profile as v1. **Timeline (new):** one vertical stream of everything that happened to this student — admissions, attendance dips, results, payments, messages sent, flags raised, notes by teachers — with the agent's one-paragraph summary at the top ("Strong until Q1; attendance fell in July, coinciding with fee arrears; Physics practical is the immediate issue").
**User actions:** add note · message guardian (drafted) · issue certificate · open any event.
**Agent actions:** summary · risk score with reasons · suggested intervention.
**PDPA:** every full-profile view by a human is logged with reason if the viewer is outside the student's class.

---

### 6.16 Admissions CRM — `/admission/enquiries` (new)

Enquiries from the website form, phone, walk-in, WhatsApp. Pipeline: enquiry → form collected → test → selected → admitted. Follow-up drafts in Bangla, conversion by source, seat availability by class.
**Agent actions:** follow-up SMS/WhatsApp drafts · duplicate enquiry merging · answers to common questions on the public form via a bounded FAQ bot (fees, dates, documents — nothing else).

---

### 6.17 Routine builder — `/routine`

As v1 plus: *Explain a conflict* · *Generate three options* with trade-offs (fewer teacher gaps vs balanced subject spread).
**Agent actions:** substitute proposals on approved leave (routine repair agent) · workload fairness report.
**Events:** `routine.published`.

---

### 6.18 Communication — `/comm`

SMS composer as v1 (audience, template, merge fields, cost shown before send, schedule, delivery log).
**WhatsApp channel (new, EduPro):** same composer, template approval status shown, media allowed (report card PDF, notice image).
**Guardian inbox (new):** replies from guardians land here, routed to the class teacher; the agent drafts a reply for common cases (leave request, fee query) and flags anything urgent (health, safety) to the head immediately without drafting.

---

### 6.19 Agent console — `/agents`

```
┌────────────────────────────────────────────────────────────────────┐
│ Agents                     Credits 1,340 / 1,500      [+ Workflow]  │
│ ● Morning brief          06:30 daily     ok        acceptance —    │
│ ● Attendance watch       16:00 daily     6 flagged 91% accepted    │
│ ● Fee reminder           10:00 daily     38 drafted 78% accepted   │
│ ● Result analysis        on publish      ran 8 Sep                 │
│ ● Remark writer          on publish      46 → 44 accepted, 2 edited│
│ ○ Guardian weekly digest Thu 18:00       paused                    │
│ ● Compliance monitor     weekly          2 gaps                    │
│ ── Fee reminder ────────────────────────────────────────────────── │
│ Trigger  daily 10:00      Scope  dues ≥ 2 months, no payment 14d   │
│ Does     draft Bangla SMS per guardian    Policy  ● Always approve  │
│ Limits   ≤100/run · ≤1 per guardian/week · ≤40 credits/run         │
│ Memory   312 guardians tracked  [inspect] [clear]                  │
│ Model    standard   [Run now] [Pause] [History] [Kill switch]      │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** enable/pause · edit trigger, scope, policy, limits · inspect/clear memory · run now · history · kill switch.
**Rules:** loosening a policy is Head-only and audited; the audit entry is shown on the card permanently.

---

### 6.20 Approval queue — `/agents/approvals`

As v1: batches, per-item edit/skip, approve, reject with reason, cost shown. **Added:** *ageing* (items older than 48h rise to the top and appear on the head's today) · *diff view* for record-change proposals · *"why this"* per item with source rows · *mobile approval* in the head app.

---

### 6.21 Workflow builder — `/agents/workflows` (new, EduPro)

Plain-language, guarded. `When [result published] → for [students with GPA < 2.00] → draft [guardian meeting invitation] → policy [always approve]`. Blocks: triggers, filters, propose-actions, policies, limits. No free-form code. Every workflow is an agent with the same anatomy and limits.
**Agent actions:** the command bar can draft a workflow from a sentence ("প্রতি সোমবার যাদের উপস্থিতি ৭০% এর নিচে, ক্লাস টিচারকে জানাও").

---

### 6.22 Migration studio — `/data/migration` (new)

```
┌────────────────────────────────────────────────────────────────────┐
│ Migration · রাজশাহী মডেল · Day 3 of 6                              │
│ Sources  📷 Register photos 84   ⬆ Excel 6   ✎ Manual 0            │
│ ── Students ─────────  412 proposed · 380 verified · 32 to review  │
│ ── Fee dues ─────────  298 proposed · 210 verified · 88 to review  │
│ ── Last exam marks ──  10 subjects · 8 verified                    │
│ ── Review: fee register p.14 ──────────────────────────────────── │
│ [ photo crop ]   Roll 17  ইমরান খান   Jul ৳1,200 ✓ Aug ৳1,200 ?    │
│                  confidence 71% — handwriting "1,200" or "1,260"?  │
│                  [1,200] [1,260] [type…]                          │
│                     [Verify & next]  [Flag for institution]        │
└────────────────────────────────────────────────────────────────────┘
```

**User actions (our onboarding specialist):** upload · review proposals by confidence · verify · flag for the institution to confirm · run the verification-day comparison · commit.
**Agent actions:** OCR and structuring of Bangla handwriting and Excel · duplicate detection · cross-checks (dues vs receipts, roll continuity) · confidence per cell.
**Rules:** nothing is committed to the live tenant until the verification-day tabulation match passes.

---

### 6.23 Consent & privacy centre — `/data/privacy` (new)

```
┌────────────────────────────────────────────────────────────────────┐
│ Consent & privacy                          PDPA 2026 · DPC: Jalal  │
│ Consent coverage   SMS 98% · App 91% · AI processing 89% · Photo 72%│
│ ⚠ 46 guardians without AI-processing consent   [send consent SMS] │
│ Access requests    2 open (export ×1, correction ×1)   [handle]    │
│ Retention          Answer scripts > 12 months: 1,204 files [purge] │
│ Read audit         Full-profile views this week: 61   [review]     │
│ Inference routing  ● Pseudonymised, cloud   ○ In-country model     │
│ Processing register  [view / export]                               │
└────────────────────────────────────────────────────────────────────┘
```

**User actions:** send consent requests · record paper consent · handle access requests within statutory time · run retention purge · switch inference routing · export processing register.
**Agent actions:** coverage gaps and expiring consents · drafts the Bangla consent notice · flags unusual read patterns.
**Rules:** an agent whose scope includes a student without AI-processing consent skips that student and says so in the run log.

---

### 6.24 Integrations hub — `/data/integrations` (new)

Cards: biometric devices (ZKTeco and compatible; sync status per device) · SMS gateways (primary/secondary) · WhatsApp Business · bKash, Nagad, Rocket, SSLCommerz · bank statement import · BANBEIS/DSHE export formats · board e-SIF export · Google Workspace / Microsoft 365 for staff identity · webhooks for the institution's own website.
**User actions:** connect, test, rotate keys, view last sync.

---

### 6.25 Committee portal — `/governance` (new)

Read-only for governing body: monthly summary (attendance, collection, results, staff), the head's report with agent-prepared appendix, meeting calendar, minutes archive, resolutions tracker.
**Agent actions:** drafts the monthly report from the data with the head's edits preserved; drafts minutes from an uploaded recording or notes (Bangla), always reviewed by the head before publishing.

---

### 6.26 Statutory returns — `/reports/statutory`

BANBEIS annual survey, DSHE monthly, stipend eligibility, MPO staff statement, board form fill-up.
**Agent actions:** pre-fills every field the system knows, highlights unknowns in yellow with a question to the office, checks arithmetic consistency across sections, exports in the required format.

---

### 6.27 Custom report builder — `/reports/custom` (new)

Pick entity → fields → filters → grouping. Or describe it in the command bar ("class-wise collection for August with counts of fully paid students") and the builder fills itself; the user sees and adjusts the definition before running. Saved, scheduled, letterheaded.

---

### 6.28 Subscription & billing — `/settings/billing`

As v1 plus credit usage by agent, month-on-month, and a plan-change preview listing exactly which agents and access are gained or lost.

---

### 6.29 Platform: tenant health & agent tuning — `/admin/tenants/:id`

As v1 health checklist plus per-agent acceptance rates, average edit distance on accepted drafts, credit burn vs plan, inference cost, and a per-tenant prompt/template override panel for our support team (audited).

---

## 7. Mobile apps

All apps: Bangla first, offline queue for entry screens, biometric login, push.

**Teacher app** — today's periods with one-tap attendance (voice and scan) · marks entry with mark-sheet scan · homework (agent draft → edit → set) · assignment review · drafted guardian messages · routine · leave · notices · student lookup.

**Guardian app** — child selector · today's attendance · dues with pay-now (bKash/Nagad link) · results and report card PDF · homework · routine · notices · message class teacher · leave application · consent management · weekly digest (if enabled). No agent talks to a guardian directly except through content a human approved.

**Student app** — routine · homework · attendance · results · materials · library due dates · exam schedule and admit card · a **bounded study helper** that explains a topic from the syllabus and the institution's materials, does not do assignments, and logs usage to the class teacher in aggregate.

**Head app** — morning brief · today's numbers · **approvals with swipe** · at-risk lists with reasons · collection · message anyone · kill switch for any agent.

---

## 8. Data, offline, and compliance requirements

- **Tenancy:** shared Postgres schema, `institutionId` on every row, RLS enforced from a per-request setting; enterprise tier offers isolated deployment.
- **Offline:** attendance, marks entry, and fee collection at the counter work without connectivity; conflict rule is last-writer-wins per cell with both versions retained in audit; sync status visible.
- **Audit:** every mutation of marks, money, consent, and agent policy; every human read of a full student profile; every agent run with tools called, tokens, cost, and outcome.
- **Pseudonymised inference by default:** models see roll/section identifiers, not names, unless the output requires a name and consent exists.
- **Retention:** configurable per data class; published results and financial records held for statutory periods; answer-script images and inference logs purged on schedule.
- **Backups:** daily, encrypted, restore tested monthly, in-country.
- **Bangla output:** embedded fonts; PDFs via headless Chromium.

---

## 9. Conventions

- Empty states name the action and attach it.
- Destructive actions need typed confirmation and a reason.
- Every list: filters, saved views, column chooser, export, print, bulk bar.
- Every agent output: "why this" with source rows, one tap away.
- Every outbound message: recipient count and cost shown before sending.
- Agents never write to the database. They propose. People approve. Services execute.

---

## 10. Definition of "agent-native", for marketing and legal

An ERP is agent-native when: (1) agents are principals with scoped permissions enforced at the data layer; (2) agents run on schedules and events without a human prompting them; (3) every proposal passes through an approval queue or an explicitly granted policy; (4) every run is audited with cost; (5) the institution can pause or kill any agent instantly. Use this definition on the proposal. Be able to show all five in the demo.
