# F3-01 — Agent Operating Layer

| Field | Value |
|---|---|
| **Feature ID** | F3-01 |
| **Phase** | Phase 3 — Premium AI (Agent-native) |
| **Tier availability** | EduLite (result analysis only), EduPlus (8 agents, 200 credits/month), EduPro (all agents, 1,500 credits/month) |
| **Sprints** | S37, S40 (degraded modes) |
| **Milestone(s)** | M7 — Agent OS and four agents live (17 Aug 2028) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §3.1 Anatomy of an agent, §3.2 Tools, §3.5 Evaluation, §3.7 Degraded modes, §8 Pseudonymised inference |
| **Status** | Not started |

## Summary

The runtime that makes the product agent-native rather than "ERP with a chatbot". Agents are registered principals with scoped tokens enforced by row-level security. They can only read and propose through typed tools; no execute tool is ever exposed to the model. A run orchestrator triggers them by schedule, event or manual request, logs every tool call with tokens and cost, and can be killed instantly. A model gateway abstracts small/standard/frontier tiers with retries, pseudonymisation and an in-country routing switch.

## Scope

### 1. Agent registry
- Each agent definition carries the full anatomy of Spec v2 §3.1 (purpose, trigger, reads, proposes, policy, budget, memory, evaluation).

### 2. Agents as principals
- Scoped token per agent (tools, data scope, credit budget).
- RLS applies to agents exactly as to users (Spec v2 §2).

### 3. Typed tools
- Read tools (pseudonymised by default) and propose tools.
- **No execute tool exposed to the model**; execution happens only after human approval via services (Spec v2 §9).

### 4. Run orchestrator
- Triggers: schedule, event (from F1-16 event log), manual.
- Run log with tools called, tokens, cost and outcome.
- Kill switch per agent and per institution, effective immediately.

### 5. Model gateway
- Tiers: small, standard, frontier; retries; pseudonymisation; in-country routing switch (set in F2-16).
- Bangla prompt templates.

### 6. Evaluation harness
- Replay runs against fixtures; acceptance-rate tracking feeds F3-02 evaluation dashboard.

### 7. Degraded modes (S40)
- No credits; model unavailable; agent paused. Each has a defined user-visible state and no silent failure.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S37 | 25 Jun–6 Jul 2028 | Agent registry, agent principals with scoped tokens under RLS, typed read and propose tools (pseudonymised), run orchestrator, run log with cost, kill switch, model gateway (tiers, retries, pseudonymisation, in-country routing switch), Bangla prompt templates, evaluation harness |
| S40 | 6–17 Aug 2028 | Degraded modes → **M7** |

## Dependencies

- **Upstream (needs):** F1-01 RLS, F1-16 events and proposals schema, F1-15/F2-16 consent and routing switch.
- **Downstream (unblocks):** F3-02, every standard agent (F3-03), F3-04, F3-05, F3-06, F3-07, all add-ons.

## Acceptance criteria

- [ ] An agent token scoped to attendance cannot read fee data; verified by test.
- [ ] No tool available to the model can write to any domain table.
- [ ] A scheduled agent runs at its time without human action and its run log shows tools, tokens and cost.
- [ ] Kill switch stops a running agent and prevents new runs within seconds.
- [ ] With the in-country switch on, no request leaves the permitted region; verified by gateway logs.
- [ ] Model inputs contain roll/section identifiers rather than names unless consent and output need require otherwise.
- [ ] Each degraded mode shows a clear state in the agent console and head mode.

## Out of scope / deferred

- Approval queue, policies, credits ledger (F3-02).
- Custom workflows (F3-07).

## Open questions

- Model vendors per tier and which are available in-country.
- Credit-to-cost conversion per tier (business plan: 1 credit ≈ one run or one document).
