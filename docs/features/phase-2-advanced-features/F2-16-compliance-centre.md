# F2-16 — Compliance Centre

| Field | Value |
|---|---|
| **Feature ID** | F2-16 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | All tiers (legal requirement); counter close for all with fees |
| **Sprints** | S34 (read audit), S35 |
| **Milestone(s)** | M6 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.13 Counter close & reconciliation, §6.23 Consent & privacy centre |
| **Status** | Not started |

## Summary

Consent and privacy centre v1 on top of F1-15: coverage per purpose, consent-request SMS, paper consent, access requests with the statutory clock, retention purge, processing register export and the inference-routing switch. Also the read audit of full-profile views and, grouped here by the sprint plan, counter close and reconciliation for the cashier.

## Scope

### 1. Consent and privacy centre v1
- Coverage dashboard per purpose.
- Consent-request SMS campaign; paper consent capture.
- Access requests with statutory clock and status.
- Retention purge per data class.
- Processing register export.
- **Inference-routing switch** (in-country only vs allowed external) consumed by F3-01.

### 2. Read audit
- Log every human read of a full student profile (Spec v2 §8) and report on patterns.

### 3. Counter close and reconciliation
- End-of-day close: cash counted vs receipts; gateway and bank-slip matching; discrepancy list.
- Emits `counter.closed` (triggers F3-03h).

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S34 | 14–25 May 2028 | PDPA read audit of full-profile views |
| S35 | 28 May–8 Jun 2028 | Consent and privacy centre v1; counter close and reconciliation |

## Dependencies

- **Upstream (needs):** F1-15, F1-07, F2-05, F1-12.
- **Downstream (unblocks):** F3-01 routing switch, F3-03h collection reconciliation, F3-03j compliance monitor.

## Acceptance criteria

- [ ] Coverage shows percentage of guardians consented per purpose and lists gaps.
- [ ] An access request shows days remaining on the statutory clock and turns red when overdue.
- [ ] Retention purge deletes only data past its class retention and not under legal hold; the purge is audited.
- [ ] Opening a full student profile creates a read-audit row visible to the Data Protection Contact.
- [ ] Counter close lists every receipt not matched by cash, gateway or bank slip.

## Out of scope / deferred

- Agent-driven consent gap detection (F3-03j).

## Open questions

- Statutory response period for access requests under PDPA 2026.
