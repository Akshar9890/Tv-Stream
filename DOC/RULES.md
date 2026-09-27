# RULES — Coding Rules
**Project:** StreamHub

## 1. Backend (assume Node.js/TypeScript or similar — adjust to actual stack choice, see `DECISIONS.md`)
- Strict typing on, no `any` without a comment explaining why.
- Async all the way down; no blocking calls in request handlers.
- Feature-folder structure (`features/billing/`, `features/upload/`) over technical-layer folders.
- Every entitlement check happens server-side before a playback URL is issued — never trust a client-reported "I'm subscribed."

## 2. Web frontend
- Function components + hooks only.
- Video player logic isolated in its own module — player state (buffering, quality, captions) should not leak into unrelated UI state.
- No autoplay-with-sound anywhere (see `MOTION_GRAPHICS.md` §6).

## 3. TV apps
- **Android TV / Fire TV (Kotlin):** use Media3/ExoPlayer for playback, Leanback or Compose for TV for UI — do not hand-roll video playback or focus management from scratch.
- **Roku (BrightScript/SceneGraph):** follow Roku's own Direct Publisher / Media Streaming channel certification guidelines from day one — retrofitting certification compliance late is expensive.
- Every screen must be fully navigable via D-pad only — no feature ships if it requires a pointer/touch input that TV remotes don't have.

## 4. Database / migrations
- All schema changes via migrations, never hand-edited in production.
- Every table has `created_at`/`updated_at`.
- Soft-delete for `titles`, `users`, `subscriptions` — never hard-delete a row billing/moderation history might reference.

## 5. Commits & PRs
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- One task ≈ one PR.
- A PR touching entitlement, billing, or the moderation/upload pipeline requires an explicit second reviewer — no single-approver merges on those paths (see `AGENTS.md` §5 escalation list).

## 6. Secrets
- No secrets in code, ever. DRM provider keys, payment processor keys, and CDN signing keys live in a secrets manager, referenced at runtime.

## 7. Definition of done (every task)
- [ ] Implements exactly the task's acceptance criteria
- [ ] Tests added/updated (`TESTING.md`)
- [ ] No new build/lint warnings
- [ ] `DECISIONS.md` entry added for non-obvious choices
- [ ] If it touches upload/moderation/billing/DRM: explicitly confirmed it doesn't create a path around the rights-attestation or entitlement checks (`PRD.md` §2, `AGENTS.md` §2)
