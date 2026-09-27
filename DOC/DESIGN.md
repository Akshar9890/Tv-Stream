# DESIGN — UI System
**Project:** StreamHub — web + TV visual system.

## 1. Design principle
TV is the primary surface, not an afterthought. Every screen is designed TV-first (large touch targets replaced with large *focus* targets, high contrast, legible from 10 feet), then adapted down to web/mobile — not the other way around.

## 2. Tokens
| Token | Value | Notes |
|---|---|---|
| `--bg` | near-black `#0a0a0f` | Streaming-platform dark theme reduces eye strain for long viewing sessions |
| `--surface` | `#15151f` | Cards, rows |
| `--surface-raised` | `#1e1e2b` | Modals, focused card background |
| `--text-primary` | `#f5f5f7` | |
| `--text-secondary` | `#9a9aa8` | |
| `--accent` | `#e5493d` → adjust to brand | Primary CTA, focus ring |
| `--radius` | 6px cards, 4px buttons | |
| Font | Inter (UI), system fallback on TV platforms with limited font support | |

## 3. Screens (web + shared conceptually with TV, layout differs)
### 3.1 Home
- Hero banner (autoplay muted preview optional, must be pausable/skippable)
- Horizontal content rows ("Continue watching", "Trending", genre rows)
- Row items: poster, title on hover/focus, progress bar if partially watched

### 3.2 Title detail
- Poster/backdrop, synopsis, cast, genre tags
- Series: season selector + episode list
- Primary CTA: Play / Resume from [timestamp]

### 3.3 Player
- Minimal chrome, auto-hides during playback
- Controls: play/pause, seek bar, 10s skip back/forward, audio/subtitle track selector, quality selector (or auto), cast button (web)
- Resume-position prompt on re-entry

### 3.4 Search
- Instant search-as-you-type (web), explicit search-then-submit on TV (remote text entry is slow — don't fire a request per keystroke on TV)

### 3.5 Account/billing
- Plan selection, payment method, subscription status, cancel flow (must be as easy as sign-up — no dark patterns)

### 3.6 Upload & rights attestation (content-owner facing, not consumer facing)
- File upload, metadata form (title, series/season/episode, genre)
- **Mandatory rights attestation step** — checkbox + text confirmation is not sufficient alone; require selecting which of `PRD.md` §2's three buckets applies and, for licensed content, a reference/ID for the license record
- Cannot submit without completing attestation

## 4. TV-specific rules (Android TV / Fire TV / Roku)
- **Focus, not hover.** Every interactive element has a clear, high-contrast focus state (border + scale, not just a color shift — color-only focus is invisible to some viewers and washes out on many TV panels).
- Minimum tap/focus target: comfortable D-pad navigation grid, no dense clickable text.
- No text input–heavy flows on the main navigation path — voice search or minimal on-screen keyboard only where unavoidable.
- Safe area: keep all critical content within the TV-safe title-safe zone (~90% of screen) — many TVs overscan.

## 5. Accessibility
- Captions/subtitles are a first-class feature, not an afterthought toggle buried in a menu.
- Minimum contrast 4.5:1 for body text.
- All player controls reachable via keyboard (web) and D-pad (TV) — no mouse-only or touch-only controls.
