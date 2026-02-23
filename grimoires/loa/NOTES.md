# Agent Working Memory (NOTES.md)

> This file persists agent context across sessions and compaction cycles.

## Session Continuity

Current focus: Not set
Last task: None
Status: New session

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-21 | Cache: result stored [key: 9d160cf3...] | Source: cache |
| 2026-02-10 | Cache: result stored [key: 8fecbe99...] | Source: cache |

## Blockers

(None)

## Technical Debt

(None)

## Learnings

(None)

## Known Risks

- **[Archetype: Full-Stack App]**: XSS through unsanitized user content
- **[Archetype: Full-Stack App]**: CSRF on state-changing endpoints
- **[Archetype: Full-Stack App]**: Insecure direct object references (IDOR)
