# F1-12 — SMS Notification

| Field | Value |
|---|---|
| **Feature ID** | F1-12 |
| **Phase** | Phase 1 — Core Platform (EduLite) |
| **Tier availability** | EduLite (SMS at cost), EduPlus (2/student/month included), EduPro (6/student/month included) |
| **Sprints** | S4, S6 (due reminders), S11 (result SMS) |
| **Milestone(s)** | M1 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.18 Communication, §9 Conventions (cost before send) |
| **Status** | Not started |

## Summary

The single outbound messaging service every module uses. Dual gateways with failover, correct Unicode (Bangla) segment counting, a cost preview before every send, templates with merge fields, an audience builder, scheduling, a delivery log, and a per-institution balance ledger. Absence, due-reminder and result SMS are the first three consumers.

## Scope

### 1. Gateway service
- Primary and secondary gateway with automatic failover.
- Unicode segment counting (70-char Bangla segments) and per-segment cost.
- Delivery-report log per message.

### 2. Composer
- Templates with merge fields; audience builder (class, section, role, saved views); scheduling.
- **Cost preview before every send** showing recipient count, segments and total cost (Spec v2 §9).

### 3. Balance
- Per-institution SMS balance ledger; SMS pack top-ups via F1-01 billing; never bill retroactively (business plan §6).

### 4. Module consumers
- Absence SMS (F1-05), due reminder SMS (F1-07), result SMS (F1-06), admission selected SMS (F1-04).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S4 | 8–19 Nov 2026 | SMS service (dual gateway, Unicode segments, templates, merge fields, cost preview, scheduling, delivery log, balance ledger); SMS composer and log; absence SMS |
| S6 | 6–17 Dec 2026 | Due-list reminder SMS |
| S11 | 25 Apr–6 May 2027 | Result SMS (segment-optimised); publish → SMS review |

## Dependencies

- **Upstream (needs):** F1-01 (billing for packs), F1-03 (guardian phones), F1-15 (consent per purpose before sending).
- **Downstream (unblocks):** every notification feature; F2-01 push with SMS-fallback rule; F2-07 integrations hub gateway cards; F2-13 WhatsApp channel shares composer; F3-03c fee reminder and F3-03d attendance watch draft SMS batches.

## Acceptance criteria

- [ ] A Bangla message of 71 characters is counted as two segments and priced accordingly in the preview.
- [ ] When the primary gateway fails, the message is sent via the secondary and the log shows which gateway delivered.
- [ ] A send is refused when the institution balance is insufficient, with the shortfall shown.
- [ ] Guardians who have not consented to SMS are excluded from the audience and the count reflects that.
- [ ] Scheduled sends fire at the scheduled time and appear in the log with delivery status.

## Out of scope / deferred

- WhatsApp (F2-13).
- Push notifications (F2-01).
- Agent-drafted SMS batches (Phase 3, always through the approval queue).

## Open questions

- Which two gateways (vendor selection) and their DLR formats.
- Sender ID masking rules and whether it is per institution.
