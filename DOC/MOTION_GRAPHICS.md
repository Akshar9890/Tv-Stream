# MOTION GRAPHICS — Design (motion/animation system)
**Project:** StreamHub

## 1. Principle
Motion should communicate state changes (loading, focus, transition) — never decoration for its own sake, and never anything that delays getting to playback. On TV, motion also has to read clearly from a couch, and must never fight D-pad navigation speed.

## 2. Timing & easing
| Use | Duration | Easing |
|---|---|---|
| Focus highlight (card scale/glow) | 150ms | ease-out |
| Row/carousel scroll | 250ms | ease-in-out |
| Page transition (crossfade) | 200ms | ease-in-out |
| Modal/sheet enter | 200ms | ease-out |
| Modal/sheet exit | 150ms | ease-in |
| Loading skeleton shimmer | 1.4s loop | linear |
| Hero autoplay preview fade-in | 400ms, after 1.5s dwell | ease-in |

Nothing exceeds ~250ms for a navigation-blocking transition — TV remotes are used for rapid-fire navigation, and slow transitions feel laggy fast.

## 3. Focus animation (TV — critical, see `DESIGN.md` §4)
- On focus: scale to 1.05–1.08×, add a 2px accent-colored border, subtle elevation shadow.
- Transition must be interruptible — rapid D-pad movement across a row should not queue up a backlog of animations; cancel the previous transition and start the new one immediately (use CSS transitions with `will-change`/transform, not JS animation queues, so the browser/TV OS handles interruption natively).
- Never animate focus by changing layout-affecting properties (width/height/margin) — use `transform: scale()` only, to avoid reflow jank on lower-powered TV hardware.

## 4. Loading states
- Skeleton screens (shimmering placeholder rows/cards) for catalog loading — never a blank screen or spinner-only for content-heavy views.
- Player buffering: a minimal centered spinner only, no branded animation that delays perceived load time.

## 5. Reduced motion
- Respect `prefers-reduced-motion` on web: replace scale/slide transitions with opacity-only crossfades.
- TV platforms don't expose this OS-level, so keep default TV motion conservative (small scale deltas, short durations) rather than relying on a reduced-motion escape hatch that doesn't exist there.

## 6. What NOT to animate
- No animated splash/logo screen beyond a single brief brand flash on cold launch (TV app store review guidelines on some platforms flag slow-to-interactive launches).
- No parallax scrolling effects — expensive on TV hardware, no functional benefit.
- No autoplay-with-sound anywhere; hero preview autoplay is muted-only and must be easily skippable/pausable.
