# MEMORY — Project Context
**Project:** StreamHub — living snapshot of current state. Update at the end of every working session (`AGENTS.md` §3) so the next session doesn't need to re-derive context from a diff.

## 1. What this project is
A public streaming platform (web + Android TV + Fire TV + Roku) with subscription billing. Placeholder name "StreamHub" — swap for real branding when decided.

## 2. Key decisions already made (see `DECISIONS.md` for full rationale)
- Audience: public, many users, with billing (not a personal/family media server).
- TV access: dedicated native apps (Android TV, Fire TV sharing one codebase; Roku separate), not just casting or browser-in-TV.
- Content must fall into one of three buckets: owned, licensed (with DRM), or user-uploaded-with-rights (with DMCA process) — see `PRD.md` §2. This is a hard constraint, not a suggestion.
- Moderation queue sits between Upload and Transcoding — no content skips review before going live.

## 3. Open questions / not yet decided
- Final tech stack for backend (Node/TS assumed as a placeholder in `RULES.md` — confirm or change)
- Which DRM provider (needs to match whatever licensing partners require, if any)
- Payment processor (Stripe vs Razorpay vs other, likely region-dependent)
- Real branding/name to replace "StreamHub" throughout all docs
- Whether v1 launches with licensed content, owned content only, or user-generated uploads — this materially changes how much of the DRM/licensing work is needed on day one vs deferred

## 4. What's built so far
- **Web Application Client (`streamhub-web`):** Fully operational React 18 + Vite + TypeScript web application complying with `DESIGN.md` tokens, `MOTION_GRAPHICS.md` timing rules, and `RULES.md` feature-folder architecture.
- **TV D-Pad Spatial Navigation Engine:** Full directional navigation (`useTvNavigation`), keyboard listener, and an interactive on-screen Virtual TV Remote for couch testing, plus a 90% Title-Safe TV guide overlay toggle.
- **Video Player Module (`src/features/player/VideoPlayer.tsx`):** Isolated player with custom TV controls, adaptive bitrate quality selector (Auto, 1080p, 720p, 480p), audio/subtitle tracks selector, resume position prompt, and server-side/state entitlement gating.
- **Creator Master Upload & Rights Attestation Portal (`src/features/upload/UploadRightsModal.tsx`):** Strictly enforces `PRD.md` §2 and `ARCHITECTURE.md` §4; content cannot be submitted without attesting to one of the 3 buckets (Owned, Licensed with License ID, or User-Generated with DMCA terms). All uploads enqueue into Trust & Safety moderation.
- **Trust & Safety / Legal Operations Dashboard (`src/features/moderation/ModerationDashboard.tsx`):** Moderation review queue with rights provenance audit, approval into simulated ABR transcoding pipeline, and statutory DMCA takedown intake & execution under the <24h SLA.
- **Subscription & Billing Management (`src/features/billing/SubscriptionModal.tsx`):** Free, Super VIP, and Premium 4K tiers with instant entitlement provisioning and zero-dark-patterns cancellation.
- **Automated Test Suite (`src/tests/streamhub.test.ts`):** 5/5 passing Vitest tests proving entitlement gating, rights attestation enforcement, moderation pipeline invariants, and DMCA instant takedowns.

## 5. Session log
```
2026-09-27 — Implemented production web client scaffold (React 18 + Vite + TS), TV D-Pad spatial engine, custom video player with entitlement gating, creator upload rights attestation portal, Trust & Safety moderation queue, DMCA SLA takedown manager, and Vitest test suite.
2026-09-27 — Added real offline movie download engine (/api/download-proxy, DownloadManager, DownloadsModal), binary video file upload pipeline (/api/upload-movie, persistent catalog sync across all devices via /api/custom-catalog), and multi-device connection hub (ConnectDeviceModal with QR code for mobile camera scan, Smart TV browser instructions with pairing PIN, and public tunnel guidance).
2026-09-27 — Simplified platform for home streaming use case per user directive: removed legal rights attestation form, bucket radios, copyright warranties, DMCA takedown checkboxes, and Trust & Safety moderation queue. Uploads now instantly publish to local server storage and appear on all connected TVs, phones, and laptops in a dedicated "My Uploaded Movies & Shows" row.
```

