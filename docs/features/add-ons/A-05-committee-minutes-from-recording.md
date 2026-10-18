# A-05 — Committee Minutes from Recording (Add-on)

| Field | Value |
|---|---|
| **Feature ID** | A-05 |
| **Phase** | Optional add-on (quoted separately) |
| **Tier availability** | Add-on for EduPro (requires committee portal) |
| **Sprints** | S52 |
| **Milestone(s)** | — (post-M8) |
| **Spec v2 reference** | [product-spec-v2.md](../../../product-spec-v2.md) §6.25 Committee portal |
| **Status** | Not started (optional) |

## Summary

Upload a meeting recording; Bangla speech-to-text produces draft minutes and a resolutions list for the head's review, which then publish to the committee portal (F2-12).

## Scope

- Bangla speech-to-text of meeting audio.
- Draft minutes with agenda structure and extracted resolutions.
- Head reviews and edits; publish to the minutes archive and resolutions tracker.
- Audio retention per policy; in-country processing switch respected.

## Sprint delivery

| Sprint | Dates | Delivered in this sprint |
|---|---|---|
| S52 | 1–12 Apr 2029 | Committee minutes from recording; regression and release |

## Dependencies

- **Upstream (needs):** F2-12, F3-01 gateway (speech model), F3-02 approval.
- **Downstream (unblocks):** none.

## Acceptance criteria

- [ ] A one-hour Bangla recording produces draft minutes with resolutions extracted.
- [ ] Minutes are not visible to committee members until the head approves.
- [ ] Audio is purged per retention policy after approval.

## Out of scope / deferred

- Live transcription during meetings.

## Open questions

- Speaker identification and whether members consent to recording.
