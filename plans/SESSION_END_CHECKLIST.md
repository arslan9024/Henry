# Session-End Checklist

Run through this list **before declaring a session done**. The tracker is the project's single source of truth — keeping it accurate is non-negotiable.

## 1. Code Quality Gate
- [ ] `get_errors` clean on every file touched this session
- [ ] `npm run build` passes (record output line in Validation Log)
- [ ] If backend touched: `/api/records/*` smoke test passes (POST archive + POST file)

## 2. Tracker Sync (`plans/implementation/IMPLEMENTATION_TRACKER.md`)
- [ ] Each completed task moved to **Done** with concrete *evidence* (file paths, command names)
- [ ] In-progress tasks reflect actual state (no stale "In Progress" rows)
- [ ] Blocked tasks state the unblocking artifact required
- [ ] `Progress: X/Y (NN%)` updated
- [ ] `Last Updated:` set to today's date
- [ ] **Validation Log** appended with date + command + outcome
- [ ] **Decision Log** appended for any architecture/scope changes
- [ ] **Next Actions** rewritten to reflect what the next session should pick up first

## 3. Session Doc
- [ ] Session doc exists in `plans/sessions/YYYY-MM-DD_session-NN_<slug>.md`
- [ ] Work Log, Validation, Decisions, Handoff sections filled in
- [ ] All "Tracker Updates Applied" boxes ticked

## 4. Archival Hygiene
- [ ] Superseded plans moved to `plans/archive/` (do not delete)
- [ ] No planning docs left at the repo root

## 5. Final Step
- [ ] Brief text summary delivered to user
- [ ] `task_complete` tool called

> If any box above cannot be ticked, the session is **not** complete — fix or document the gap before closing.
