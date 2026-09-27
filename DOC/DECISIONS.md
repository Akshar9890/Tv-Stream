# DECISIONS — Why You Chose Things (Architecture Decision Records)
**Project:** StreamHub

```
## D-0XX: <short title>
Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded by D-0YY
Context: <what problem/question prompted this>
Decision: <what we chose>
Alternatives considered: <what else, and why not>
Consequences: <trade-offs we accepted>
```

---

## D-001: Public/billed audience, not a personal media server
Date: 2026-09-27
Status: Accepted
Context: Streaming projects range from a personal Plex/Jellyfin-style setup to a full public commercial platform.
Decision: Build for public users with accounts and billing, per explicit direction.
Alternatives considered: Personal/family self-hosted media server (rejected — explicitly not what was asked for; would need a very different architecture with none of the billing/moderation/DRM concerns).
Consequences: This pulls in real complexity and cost — billing, DRM, content moderation, multi-platform TV apps — that a personal media server would never need.

## D-002: Dedicated native TV apps, not just casting or browser-in-TV
Date: 2026-09-27
Status: Accepted
Context: TV access could be a website opened in the TV's browser, casting from a phone, or dedicated apps.
Decision: Build native apps for Android TV, Fire TV, and Roku.
Alternatives considered: Smart TV browser (rejected — inconsistent browser support/performance across TV models); cast-only (rejected — worse experience, requires a second device always present).
Consequences: Three separate app-store submission/certification processes (Google Play, Amazon Appstore, Roku Direct Publisher), each with its own review timeline and guidelines.

## D-003: Content-rights constraint is structural, not a policy afterthought
Date: 2026-09-27
Status: Accepted
Context: The original request described uploading movies/series/cartoons "like Jio Hotstar," which — for a public, billed platform — is only legally coherent if content is owned, licensed, or user-uploaded-with-rights.
Decision: Bake a mandatory moderation queue and rights-attestation step into the architecture itself (`ARCHITECTURE.md` §4) — no upload path reaches the public catalog without passing through it.
Alternatives considered: Trust-based upload with after-the-fact takedown only (rejected — legally weaker, and doesn't hold up if the *operator* is the one sourcing infringing content rather than third-party users); no rights process at all (rejected outright — not something this project will help design around).
Consequences: Slower time-to-publish for legitimate uploaders, in exchange for actually being a defensible platform.

## D-004: Third-party DRM provider, not in-house
Date: 2026-09-27
Status: Accepted
Context: Protecting licensed content against casual copying.
Decision: Integrate a managed DRM provider (Widevine/FairPlay/PlayReady via a service like Axinom, EZDRM, or similar) rather than building key management in-house.
Alternatives considered: No DRM (viable only if v1 launches with owned content that doesn't require it — rejected as the general-case default since licensed content will need it); custom DRM (rejected — extremely high effort/risk for a solved problem).
Consequences: Ongoing per-stream or subscription cost to the DRM provider; but avoids a genuinely dangerous amount of in-house cryptography/key-management risk.

## D-005: Shared codebase for Android TV + Fire TV, separate for Roku
Date: 2026-09-27
Status: Accepted
Context: Android TV and Fire TV are both Android-based; Roku runs on an entirely different OS/language.
Decision: One Kotlin/Media3 codebase targets both Android TV and Fire TV; Roku gets its own BrightScript/SceneGraph app.
Alternatives considered: Fully separate codebase per platform (rejected — unnecessary duplication given Android TV/Fire TV's shared platform base); a cross-platform framework attempting to also cover Roku (rejected — no mature cross-platform framework covers Roku's proprietary OS well).
Consequences: Two codebases to maintain instead of three, but Roku remains a genuinely separate engineering track with its own release cadence.

## D-006: HLS as the primary streaming protocol
Date: 2026-09-27
Status: Accepted
Context: Choice between HLS and MPEG-DASH for adaptive bitrate delivery.
Decision: HLS as primary — broadest native support across Apple platforms, Android, and TV OSes without extra client-side libraries in most cases.
Alternatives considered: DASH-only (rejected for v1 — better on some Android/web contexts but weaker native support on Apple ecosystem and some TV platforms without added tooling).
Consequences: Revisit if a specific TV platform's certification process strongly prefers DASH.

## D-007: Web Platform Stack and D-Pad Remote Navigation Architecture
Date: 2026-09-27
Status: Accepted
Context: Need a production-ready, TV-first web client complying with DESIGN.md, MOTION_GRAPHICS.md, PRD.md §2 rights enforcement, and RULES.md.
Decision: Built StreamHub with React 18, Vite, TypeScript, and native spatial D-Pad navigation (`useTvNavigation`), with an interactive on-screen Virtual TV Remote for testing couch experiences on desktop. Includes modular VideoPlayer with ABR multi-rendition switching, entitlement checks, 1.5s muted dwell preview, mandatory rights attestation portal (PRD §6.2), Trust & Safety moderation queue with <24h DMCA SLA takedowns, and no-dark-patterns subscription billing.
Alternatives considered: Plain static HTML/vanilla JS (rejected — too brittle for complex player state, moderation workflows, and instant multi-profile filtering).
Consequences: High performance, fully testable with Vitest, and strict adherence to PRD §2 rights attestation invariants.

