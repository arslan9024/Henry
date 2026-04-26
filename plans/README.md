# Plans Directory

Canonical location for all Henry project planning and execution-tracking documents.

## Structure

```
plans/
├── sessions/         # Per-session planning & summary docs
├── implementation/   # Active execution tracker(s) and roadmaps
└── archive/          # Completed/superseded plans
```

## Conventions

- **Session docs:** `YYYY-MM-DD_session-NN_short-slug.md`
- **Tracker doc:** `implementation/IMPLEMENTATION_TRACKER.md` is the single source of truth for progress.
- **Archival:** Move stale or superseded plans into `archive/` instead of deleting.

## Update Protocol

Every session **must** follow the operating loop below. The tracker is the project's single source of truth.

1. **Start of session** — copy `sessions/_TEMPLATE.md` to `sessions/YYYY-MM-DD_session-NN_<slug>.md` and fill in the header, scope, and plan.
2. **During the session** — append to the Work Log as files are touched.
3. **End of session** — walk through `SESSION_END_CHECKLIST.md` top to bottom. Do not skip steps; if a box can't be ticked, document the gap.
4. **Tracker sync** — update `implementation/IMPLEMENTATION_TRACKER.md`:
   - Move completed tasks to **Done** with concrete evidence (paths/commands).
   - Update `Progress: X/Y` and `Last Updated`.
   - Append a Validation Log row.
   - Append a Decision Log row if architecture/scope changed.
   - Rewrite `Next Actions` for the upcoming session.
5. **Archive** — move superseded plans into `archive/` instead of deleting.

## Current Active Initiatives

- Official DLD Ejari template adoption
- Footer chat assistant (Local Ollama)
- Generate PDF button relocation to footer
- Filesystem record archiving

See `implementation/IMPLEMENTATION_TRACKER.md` for live status.
