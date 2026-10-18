# F3-02 — Approval & Governance

| Field | Value |
|---|---|
| **Feature ID** | F3-02 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduPlus, EduPro (head-mode approvals app: EduPro) |
| **Sprints** | S38, S40 (evaluation dashboard), S41 (platform tuning panel) |
| **Milestone(s)** | M7 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §3.3 Approval queue, §3.4 Memory, §3.6 Cost, §6.19 Agent console, §6.20 Approval queue, §6.29 Platform tuning |
| **Status** | Not started |

## Summary

The human side of the agent contract. Every proposal lands in an approval queue with per-item edit and skip, diff view, cost and a "why this" link to source rows. Approval policies (Always, Batch, Auto with limits, Auto) are per agent; loosening a policy is Head-only and permanently audited. Credits are metered by tier. An agent console, credits page, agent tray and evaluation dashboard make agent activity visible.

## Scope

### 1. Approval queue
- Batches; per-item edit and skip; approve; reject with reason.
- Cost shown; 48-hour ageing; diff view; "why this" with source rows.
- Web and head-mode swipe UI (F2-04).

### 2. Approval policies
- Always, Batch, Auto with limits, Auto.
- Loosening is Head-only and permanently audited; tightening is allowed for admins.
- Per-run and per-recipient limits (e.g. max SMS per guardian per week).

### 3. Structured memory
- Per-agent memory with inspect and clear (Spec v2 §3.4).

### 4. Credits
- Credits ledger; metering by model tier; credit packs (500 / 2,000) purchased via F1-01 billing.
- Credits page per institution.

### 5. Surfaces
- Agent console (list, status, last run, kill switch).
- Agent tray and badge in the global shell.
- Evaluation dashboard (acceptance rate, alerts) — S40.
- Platform agent tuning panel (per-tenant acceptance, prompt overrides, audited) — S41.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S38 | 9–20 Jul 2028 | Approval queue (web and head-mode swipe), approval policies with audited loosening, per-run and per-recipient limits, structured memory, credits ledger and metering, agent console, credits page, agent tray and badge |
| S40 | 6–17 Aug 2028 | Evaluation dashboard (acceptance rate, alerts) → **M7** |
| S41 | 20–31 Aug 2028 | Platform agent tuning panel (per-tenant acceptance, prompt overrides, audited) |

## Dependencies

- **Upstream (needs):** F3-01, F1-16 proposals schema, F2-04 head mode, F1-01 billing.
- **Downstream (unblocks):** every agent's proposals; F3-05 do-mode proposals; F3-06 migration commits; F3-07 workflow builder.

## Acceptance criteria

- [ ] A proposal batch can be partially approved (some items edited, some skipped) and only approved items execute.
- [ ] Changing an agent from Always to Auto requires the Head role and writes a permanent audit row.
- [ ] A per-recipient limit blocks a second reminder to the same guardian inside the window.
- [ ] Credits decrease per run according to tier and the credits page matches the ledger.
- [ ] Items older than 48 hours are visibly aged in the queue.
- [ ] Evaluation dashboard shows acceptance rate per agent and raises an alert when it drops below threshold.

## Out of scope / deferred

- Custom workflow definitions (F3-07).

## Open questions

- Default policy per agent per tier (Spec v2 §3.8 gives defaults; confirm tier overrides).
- Whether "Auto" is ever allowed for outbound guardian messages (Spec v2 §7 says no agent talks to a guardian without human-approved content).
