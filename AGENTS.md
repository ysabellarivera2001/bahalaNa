# Agent Operating Contract (Production-Ready Loop)

## Core behavior (non-negotiable)
1. Start by reading relevant files and mapping dependencies (components + services + db calls).
2. Create a TODO list that breaks work into small verifiable increments.
3. Implement incrementally and keep the app buildable at all times.
4. After each meaningful chunk, run checks and fix issues immediately.
5. Do NOT claim “done” until all required checks are green.
6. End with a short code review summary: risks, edge cases, follow-ups.

## Project conventions
- Frontend: React 18 + TypeScript + Vite, functional components/hooks only.
- Styling: Tailwind-style utility classes. Match existing slate/indigo patterns.
- Data access: Supabase JS client via `lib/supabase` helpers and services in `services/`.
- Keep DB logic in Postgres/PLpgSQL under `scripts/` when appropriate.
- Avoid introducing global state managers unless explicitly requested.
- Prefer small pure helpers + clear naming over clever abstractions.

## Safety & correctness rules
- Never hardcode secrets, anon keys, or service role keys.
- Never bypass Supabase RLS assumptions; if something needs elevated access, flag it.
- Validate inputs (especially for inserts/updates) and handle empty/loading/error states.
- Keep types tight. No `any` unless there is a documented reason.

## Required checks (Definition of Done)
Run these commands and fix failures:
- Typecheck: `npx tsc --noEmit`
- Build: `npm run build`
- (If present) Tests: `npm test` or `npm run test`
- (Optional but recommended) Quick dev sanity: `npm run dev` (smoke only)

If the repo currently has pre-existing failures, do not introduce new ones.
If you must touch an area with existing TS errors, keep net-new errors = 0.

## Increment checklist (use every time)
For each TODO item:
- Implement minimal working change
- Update or add types
- Ensure UI handles loading/error/empty states
- Run: `npx tsc --noEmit`
- If passes, run: `npm run build`
- If fails, fix and repeat

## Supabase usage standards
- Prefer `.select()` with explicit columns where practical.
- Use consistent naming for returned rows vs view models.
- Normalize error handling: capture `error`, show user-friendly message, log details.

## Output format at the end
- ? What I changed (bullets)
- ? Commands I ran + results
- ?? Risks / edge cases
- ?? Follow-ups / tech debt (if any)

## ONE-PASS policy
Use a one-pass engineering workflow for all meaningful tasks.

Definition:
- Understand the task, scope, and affected modules first.
- Review nearby code, patterns, constraints, and locked files before editing.
- For non-trivial work, create a short plan before coding.
- Implement in one disciplined pass with scoped changes only.
- Keep the app buildable throughout the pass.
- Run required validation before finishing.
- If validation fails, repair immediately before closing the task.
- Summarize what changed, what was preserved, and any remaining risks.

Rules:
- Do not jump straight into code without understanding the current implementation.
- Do not ignore scope locks, file locks, or UI preservation constraints.
- Do not broaden scope just to make the implementation feel cleaner or more complete.
- Do not leave known broken tests, lint errors, type errors, or workflow regressions unresolved.
- Do not mark a task complete after only writing code; validation is part of the pass.
- For complex changes, update `PLANS.md` first and execute milestone by milestone.
- If the task cannot be completed without violating scope or touching locked files, stop and report the blocker instead of improvising.

Completion standard:
A task is only done when:
- the requested behavior is fully implemented
- only allowed files were changed
- required validations were run
- validation passed, or pre-existing failures were clearly identified with net-new failures = 0
- the result matches the user’s exact constraints

Rejection criteria:
Reject the task as incomplete if any of the following is true:
- the requested behavior is only partially implemented
- scope drift occurred
- unrelated files were changed
- locked files or forbidden files were changed
- UI/layout/styling changed without explicit approval
- existing code/UI was replaced instead of patched when preservation was required
- required validation was not run
- validation failed and was not repaired
- net-new errors, regressions, or broken workflows were introduced
- the result does not match the user’s exact constraints
- a blocker existed but the task was still presented as complete

## Drift taxonomy
Treat the task as failed if any of these occur:
- Scope drift: work moved beyond the requested objective
- File drift: edits touched files outside the approved set
- UI drift: visual/layout/interaction changed without approval
- Policy drift: required process was skipped
- Rules drift: explicit in-thread constraints were ignored

Drift checklist:
- Scope drift: did work expand beyond the requested objective?
- File drift: did any non-approved files change?
- UI drift: did any visual/layout/interaction change without approval?
- Policy drift: did you skip preflight, plan, scoped pass, or validation?
- Rules drift: did you ignore any explicit task constraints?

If any answer is yes, stop and report the drift instead of claiming completion.

## Schema change policy
- Codex may create and edit Supabase migration files.
- Codex may apply migrations to the local Supabase environment for validation.
- Codex must not push schema changes directly to production.
- For remote database changes, Codex must present the migration summary, impacted tables/columns/policies, and the exact command before execution.
- Every schema change must review impact on types, services, validation, RLS/policies, and tests.
- Prefer additive migrations over destructive changes unless explicitly approved.