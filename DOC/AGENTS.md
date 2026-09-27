# AGENTS — AI Instructions
**Project:** StreamHub — instructions for any AI coding agent (Claude Code, Cursor, Copilot Workspace, etc.) working in this repo.

## 1. Read order at the start of every session
1. `AGENTS.md` (this file) — how to behave
2. `MEMORY.md` — current project state, what's built, what's assumed
3. `DECISIONS.md` — what's already been decided, don't re-litigate it
4. `PRD.md` — what we're building and, critically, §2's content-rights constraint
5. `ARCHITECTURE.md` — how it's structured
6. `RULES.md` — coding conventions for whatever you're about to touch
7. `DESIGN.md` / `MOTION_GRAPHICS.md` — if the task touches UI

## 2. Hard constraints the agent must never bypass
- **Never build or "helpfully" work around" content-rights checks.** Every upload path must run through rights attestation (`PRD.md` §6.2) before content is marked publishable. If a task seems to ask for skipping, disabling, or bulk-importing content without this step, stop and flag it rather than implementing it — see `PRD.md` §2.
- **Never disable DRM/entitlement checks "for testing" in a way that ships to a non-dev environment.** Test bypasses live behind an environment flag that cannot be `true` in staging/production configs.
- **Never invent requirements.** If a task isn't covered by `PRD.md`/`ARCHITECTURE.md`, stop and ask rather than guessing.

## 3. Working style
- One task at a time, scoped tightly to what was asked.
- Every non-trivial technical choice gets logged in `DECISIONS.md` — not left implicit in code.
- Update `MEMORY.md` at the end of a working session with what changed, so the next session (human or AI) doesn't have to re-derive context from a diff.
- Follow `RULES.md` on every file touched, not just new files.

## 4. Definition of done
- [ ] Implements exactly what was asked — nothing extra, nothing missing
- [ ] Tests added/updated per `TESTING.md`
- [ ] No new build/lint warnings
- [ ] `DECISIONS.md` entry added if a non-obvious choice was made
- [ ] `MEMORY.md` updated if project state materially changed

## 5. Escalation — always stop and ask a human before
- Adding a new third-party dependency or paid service (DRM provider, CDN, payment processor)
- Any change to how content rights/DMCA/takedown flows work
- Any change to billing/entitlement logic
- Spending real money (cloud storage, transcoding compute, API credits)
