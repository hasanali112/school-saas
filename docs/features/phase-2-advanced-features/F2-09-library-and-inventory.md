# F2-09 — Library & Inventory

| Field | Value |
|---|---|
| **Feature ID** | F2-09 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S28 |
| **Milestone(s)** | M5 — Release 2.0 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §2 (Librarian / Store roles) |
| **Status** | Not started |

## Summary

Two small operational modules for the librarian and the storekeeper. Library: accession register, members, issue and return, fines, push reminders and camera barcode scanning. Inventory: items, stock in and out, departmental issue and low-stock alerts.

## Scope

### 1. Library
- Accession register; members (students and staff).
- Issue and return; fines posted to the student ledger (F1-07) or accounts (F1-08).
- Push reminders for due books via F2-01.
- Camera barcode scanning in the mobile app.

### 2. Inventory
- Items and categories; stock in and out; departmental issue.
- Low-stock alerts.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S28 | 19–30 Dec 2027 | Library (accession, members, issue and return, fines, push reminders, camera barcode); inventory (items, stock, issue, low-stock) |

## Dependencies

- **Upstream (needs):** F1-03, F2-01 (push, camera), F1-07/F1-08 (fines).
- **Downstream (unblocks):** student app library due dates (future).

## Acceptance criteria

- [ ] Scanning a book barcode with the phone camera opens the issue/return flow.
- [ ] An overdue book produces a fine on return and a push reminder before that.
- [ ] Issuing stock below the reorder level raises a low-stock alert.

## Out of scope / deferred

- Purchase orders and supplier management.

## Open questions

- Barcode symbology and whether the platform prints accession barcodes.
