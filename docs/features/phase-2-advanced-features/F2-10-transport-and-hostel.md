# F2-10 — Transport & Hostel

| Field | Value |
|---|---|
| **Feature ID** | F2-10 |
| **Phase** | Phase 2 — Advanced Features |
| **Tier availability** | EduPlus, EduPro |
| **Sprints** | S29 |
| **Milestone(s)** | M6 |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §2 (Transport / Hostel roles) |
| **Status** | Not started |

## Summary

Transport: routes, stops, vehicles, drivers, student assignment and a fee-head link. Hostel: buildings, rooms, beds, allocation, hostel fee, night roll call and visitor log.

## Scope

### 1. Transport
- Routes and stops; vehicles and drivers.
- Student assignment to route/stop.
- Fee-head link so transport fee appears on the invoice (F1-07).

### 2. Hostel
- Buildings, rooms, beds; allocation.
- Hostel fee-head link.
- Night roll call (attendance variant, F1-05).
- Visitor log.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S29 | 5–16 Mar 2028 | Transport (routes, stops, vehicles, drivers, assignment, fee link); hostel (rooms, beds, allocation, fee, night roll call, visitor log) |

## Dependencies

- **Upstream (needs):** F1-03, F1-05, F1-07.
- **Downstream (unblocks):** none scheduled.

## Acceptance criteria

- [ ] Assigning a student to a route adds the transport fee head to the next invoice.
- [ ] A bed cannot be double-allocated.
- [ ] Night roll call absentees are visible to the hostel superintendent and the head.

## Out of scope / deferred

- GPS vehicle tracking.

## Open questions

- Whether hostel roll call sends guardian SMS on absence like day attendance.
