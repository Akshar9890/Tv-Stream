# ARCHITECTURE — System Structure
**Project:** StreamHub

## 1. High-level component diagram
```mermaid
flowchart TB
    subgraph Clients
        WEB[Web player]
        ATV["Android TV / Fire TV app\n(shared codebase)"]
        ROKU[Roku app]
    end

    subgraph Backend
        API[Core API]
        UPLOAD[Upload service]
        TRANSCODE[Transcoding workers]
        CATALOG[Catalog service]
        BILLING[Billing / entitlement service]
        MOD[Trust & Safety / moderation queue]
    end

    STORAGE[(Object storage - S3/GCS)]
    CDN[CDN]
    DRM[DRM provider - Widevine/FairPlay/PlayReady]
    PAY[Payment processor - Stripe/Razorpay]
    DB[(Postgres)]

    WEB -->|HTTPS/JWT| API
    ATV -->|HTTPS/JWT| API
    ROKU -->|HTTPS/JWT| API

    UPLOAD --> STORAGE
    UPLOAD --> MOD
    MOD -->|approved| TRANSCODE
    TRANSCODE --> STORAGE
    STORAGE --> CDN
    CDN -->|signed/entitled URL| WEB
    CDN -->|signed/entitled URL| ATV
    CDN -->|signed/entitled URL| ROKU

    API --> CATALOG --> DB
    API --> BILLING --> DB
    BILLING --> PAY
    API -.->|license check| DRM
    CDN -.->|license check| DRM
```

## 2. Components
| Component | Responsibility |
|---|---|
| **Core API** | Auth, entitlement checks, routes clients to catalog/billing services |
| **Upload service** | Accepts large files (resumable upload), captures rights attestation (`PRD.md` §6.2), stores raw master |
| **Trust & Safety / moderation queue** | Every upload sits here until approved (or auto-approved under a defined policy) before transcoding runs — this is the enforcement point for `PRD.md` §2 |
| **Transcoding workers** | FFmpeg-based pipeline, master → multiple adaptive-bitrate HLS renditions |
| **Catalog service** | Titles, series/season/episode structure, search |
| **Billing/entitlement service** | Subscription plans, payment integration, issues short-lived playback entitlements |
| **DRM provider** | Third-party managed service (not built in-house) — issues license keys for protected playback |
| **CDN** | Serves video segments; playback URLs are signed and entitlement-checked, not public/guessable |

## 3. Playback request flow
```mermaid
sequenceDiagram
    participant TV as TV app
    participant API as Core API
    participant Bill as Billing service
    participant CDN as CDN
    participant DRM as DRM provider

    TV->>API: Request playback (titleId)
    API->>Bill: Check entitlement (userId, titleId)
    Bill-->>API: Entitled (or 402/403)
    API-->>TV: Signed manifest URL + DRM license URL
    TV->>CDN: Request HLS manifest + segments
    TV->>DRM: Request license key
    DRM-->>TV: License key (time-limited)
    TV->>TV: Decrypt + play
```

## 4. Upload → publish flow
```mermaid
sequenceDiagram
    participant Owner as Content owner
    participant Up as Upload service
    participant Mod as Moderation queue
    participant Trans as Transcoding
    participant Cat as Catalog

    Owner->>Up: Upload master + rights attestation
    Up->>Mod: Enqueue for review
    Mod->>Mod: Human/automated review
    Mod-->>Trans: Approved
    Trans->>Trans: Generate ABR renditions
    Trans-->>Cat: Publish to catalog
```
No path exists from Upload directly to Catalog that skips the moderation queue — this is intentional, not an oversight to "optimize away."

## 5. TV app architecture note
Android TV and Fire TV share a single Kotlin/ExoPlayer (Media3) codebase and can largely share a build target; Roku requires a fully separate codebase (BrightScript/SceneGraph) since it's a different platform entirely. Both hit the same Core API — no platform-specific backend logic.

## 6. Why DRM is not optional for licensed content
If any content falls under `PRD.md` §2 bucket 2 (licensed third-party content), the license agreement itself will almost certainly require DRM, geo-restriction, and concurrent-stream limits as contractual terms — this isn't an engineering nice-to-have, it's what makes the license valid to sign in the first place. See `DECISIONS.md`.
