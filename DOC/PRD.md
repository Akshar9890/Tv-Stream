# PRD — Requirements
**Project:** StreamHub (placeholder name) — public video streaming platform with dedicated TV apps

## 1. Vision
A subscription-based video streaming platform — web + Android TV + Fire TV + Roku — where a catalog of movies, series, and cartoons is uploaded, transcoded, and delivered to a large public audience with accounts and billing.

## 2. Non-negotiable constraint — content rights (read this first)
StreamHub may only ever serve content that falls into one of these buckets:
1. **Originally produced/owned content** (yours or your studio's).
2. **Properly licensed third-party content**, with a signed distribution agreement — this typically *requires* DRM, geo-restriction, and concurrent-stream limits as contractual terms, not optional features (see `ARCHITECTURE.md`, `DECISIONS.md`).
3. **User-generated uploads**, where the *uploader* owns or has rights to what they upload, StreamHub is not itself sourcing the content, and there is a functioning DMCA/notice-and-takedown process.

No feature in this document set should be interpreted as a way to host commercial movies/shows (e.g. actual Disney/Hotstar catalog titles) without rights. This is a legal requirement, not a style preference, and it shapes the Upload and Trust & Safety modules below.

## 3. Target users
| Persona | Description | Core need |
|---|---|---|
| **Viewer** | Public subscriber, primarily watches on TV | Fast discovery, reliable playback, easy TV navigation |
| **Content owner/uploader** | Uploads content they own or are licensed to distribute | Simple upload flow, clear rights attestation, catalog visibility |
| **Admin/Trust & Safety** | Reviews uploads, handles takedown requests | Fast moderation queue, audit trail |

## 4. Goals
- G1: Reliable adaptive-bitrate playback across web, Android TV, Fire TV, and Roku.
- G2: Subscription billing with entitlement checks before every stream starts.
- G3: A working DMCA/takedown pipeline live before any user-generated uploads go public (§2 bucket 3).
- G4: TV-first navigation — D-pad/remote control, no mouse/touch assumptions on TV apps.

## 5. Non-goals (v1)
- Live linear TV / broadcast channels (VOD only for v1).
- Offline downloads (Phase 2).
- Multi-language dubbing/subtitling pipeline beyond basic subtitle file upload (Phase 2).
- In-house DRM implementation — v1 uses a third-party DRM provider (Widevine/FairPlay/PlayReady via a managed service), not custom key management.

## 6. Core features (MVP)
1. **Accounts & billing** — sign-up/login, subscription plans, payment (Stripe/Razorpay), entitlement gating on playback
2. **Upload & rights attestation** — content owner uploads a master file and explicitly attests to rights/license; nothing goes live without this step
3. **Transcoding pipeline** — master file → multiple adaptive-bitrate renditions (HLS)
4. **Catalog** — titles, series/season/episode structure, posters, genres, search
5. **Web player** — adaptive playback, resume position, captions
6. **TV apps** — Android TV, Fire TV (shared codebase), and Roku, all hitting the same backend APIs
7. **Trust & Safety** — moderation queue for new uploads, DMCA takedown request intake + processing SLA

## 7. Success metrics
- Playback start success rate (target ≥ 99%)
- Rebuffer ratio per session (target < 1%)
- Time from takedown request received → content removed (target < 24h)
- Subscription conversion rate, churn rate

## 8. Phase 2
- Offline downloads on TV/mobile
- Multi-audio-track / subtitle localization pipeline
- Recommendation engine (personalized rows)
- Live channels
