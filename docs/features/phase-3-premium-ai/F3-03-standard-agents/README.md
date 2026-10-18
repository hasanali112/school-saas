# F3-03 — Standard Agents (12)

| Field | Value |
|---|---|
| **Feature ID** | F3-03 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduLite: result analysis only (on publish). EduPlus: 8 standard agents, 200 credits/month. EduPro: all 12, 1,500 credits/month |
| **Sprints** | S39–S49 |
| **Milestone(s)** | M7 (four agents live, 17 Aug 2028), M7a (register digitiser), M8 |
| **Spec v2 reference** | [product-spec-v2.md](../../../../product-spec-v2.md) §3.8 Standard agents (shipped) |
| **Status** | Not started |

The twelve agents shipped with the platform. Each runs on the operating layer (F3-01), proposes through the approval queue (F3-02), and never writes to the database. One spec per agent below; every spec records the trigger, what the agent reads, what it proposes and its default approval policy from Spec v2 §3.8.

| ID | Agent | Trigger | Default policy | Sprint |
|---|---|---|---|---|
| [F3-03a](F3-03a-result-analysis.md) | Result analysis | `result.published` | Auto (read-only) | S39 |
| [F3-03b](F3-03b-remark-writer.md) | Remark writer | `result.published` | Batch | S39 |
| [F3-03c](F3-03c-fee-reminder.md) | Fee reminder | 10:00 daily | Always | S40 |
| [F3-03d](F3-03d-attendance-watch.md) | Attendance watch | 16:00 daily | Auto with limits / Always | S40 |
| [F3-03e](F3-03e-morning-brief.md) | Morning brief | 06:30 daily | Auto (read-only) | S41 |
| [F3-03f](F3-03f-dropout-risk.md) | Dropout risk v1 | Weekly | Auto with limits | S43 |
| [F3-03g](F3-03g-routine-repair.md) | Routine repair | `leave.approved` | Always | S44 |
| [F3-03h](F3-03h-collection-reconciliation.md) | Collection reconciliation | Counter close | Auto (read-only) | S44 |
| [F3-03i](F3-03i-register-digitiser.md) | Register digitiser | Manual (migration) | Always | S45 |
| [F3-03j](F3-03j-compliance-monitor.md) | Compliance monitor | Weekly | Auto (read-only) | S46 |
| [F3-03k](F3-03k-statutory-return-prep.md) | Statutory return prep | Calendar | Always | S47 |
| [F3-03l](F3-03l-question-paper-drafter.md) | Question paper drafter | Manual | Always | S48–S49 |

**M7 "four agents live"** = result analysis, remark writer, fee reminder, attendance watch.

## Open questions (module level)

- Which 8 of the 12 form the EduPlus set (business plan says "8 standard agents" without naming them).
- Credit cost per agent run per model tier.
