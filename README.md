# Character Roulette — cinematic PWA

A complete React / TypeScript rebuild of the original Flutter application, in the **same repository**. A mobile-first game night experience with an original procedural selection chamber, eight challenges, offline play and a clean broadcast presentation. No account, API, camera or backend is required.

The original native application is preserved by Git tag **`flutter-phase-one`**, commit **`3a91014`**, and its Flutter source directories remain intact. [Migration audit and plan](docs/pwa/MIGRATION.md). [Original Flutter instructions](docs/FLUTTER-ORIGINAL.md).

## Install on iPhone or iPad

1. Open the published HTTPS link in **Safari**.
2. Wait for the initial app shell to finish downloading; the app confirms offline readiness.
3. Tap **Share → Add to Home Screen → Add**. Leave “Open as Web App” enabled if offered.
4. Open Character Roulette from your home screen. It runs in standalone mode and works offline after a complete first load.

No Xcode, TestFlight, App Store or paid Apple Developer account is needed. Your preferences are local to the current browser/installed app; use Settings → Export/Import to move them between browser profiles or devices. Browsers may evict offline data under storage pressure, so reopen online if that happens.

Chrome and Edge offer an Install app command on desktop where supported. The app's install button explains Safari installation or invokes the browser's native install prompt when available.

## Local development

Use **Node 22.12+** (Node 25 was used here) and npm.

```sh
cd /Users/erni/marvel_character_roulette
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite listens on the local network for development. PWA registration is deliberately disabled in development to avoid stale caches during editing. Use the production preview for offline/install tests.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

The optimized static output is **`dist/client/`**. Preview runs at `http://localhost:4173`. Service workers work on localhost; an iPhone visiting a plain HTTP LAN address does **not** receive the same install/offline guarantees. Use the public HTTPS deployment to test installation on a phone.

## Architecture

| Area | Responsibility |
| --- | --- |
| `src/domain/game.ts` | Repository interface, 120 placeholder IDs, independent selection, original mode pools, challenge definitions, round scoring and player rotation |
| `src/domain/settings.ts` | Validated versioned preferences and legacy Flutter JSON compatibility |
| `src/app/Store.tsx` | Settings, recoverable session state, pure game reducer and navigation |
| `src/app/App.tsx` | Responsive shell, cinematic screen transitions, keyboard/stream controls, focused dialogs, installation and recovery UI |
| `src/screens/` | Menu, setup, roulette, challenge, result and settings; splash is part of the shell |
| `src/components/UI.tsx` | Tactile buttons, typography, fields, toggles, ranges and shared UI primitives |
| `src/components/Stage.tsx` | Full-body presentation boundary, SVG fallback and still-render composition |
| `src/graphics/ChamberScene.tsx` | Lazy Three.js chamber, faceted human-form sculpture, mechanical aperture, physical materials and procedural studio lighting |
| `src/hooks/useCountdown.ts` | Monotonic timing, pause/resume, inactive-window handling and restoration |
| `src/hooks/usePWA.ts` / `src/sw.ts` | Explicit updates, install support, versioned precache, offline navigation and update recovery |
| `src/styles/index.css` | Material/lighting system, motion tokens, dedicated phone/tablet/desktop and landscape compositions |
| `tests/` | Domain/timer tests and production-browser/PWA integration tests |

Vite and Tailwind CSS provide the build foundation; Motion handles coordinated UI transitions and interactions. Three.js is confined to the character stage. GSAP and React Three Fiber were unnecessary for this implementation, so they were not added. Every dependency is free and open-source. Fonts are bundled locally with their licenses; no runtime font CDN is required.

The art direction uses an illuminated mechanical chamber rather than floating dashboard cards. The placeholder figure, platform and room reflections are procedural; no Marvel render, stock character or downloaded 3D model is bundled. Full-body composition includes feet and head, with no square portrait crop.

## Gameplay retained and improved

- Three modes: Party, Knowledge, Chaos; original mode-specific challenge pools.
- Setup: 1–10 players, 15/30/45/60/90 seconds, 5/10/15/20/unlimited rounds, difficulty, language and presentation mode.
- A 4.4-second roulette with acceleration, high-speed ID trails, deliberate deceleration, reactive lighting, impact and reveal. Skip locks the already chosen winner; it never rerolls. Reduced motion uses a 0.8-second sequence without spatial effects.
- Taboo, Mime, Three Clues, One Word, Reverse Guess, Roleplay, Speed Guess and Random Chaos. Each has its own icon, accent, title choreography and instructions.
- Monotonic countdown, start/pause/resume, skip, finish, timeout failure, retry, player rotation and session completion. Speed Guess overrides duration to five seconds.
- Success earns **100 + 5 × seconds remaining**; skip/timeout earns zero. Retry replaces the previous attempt and cannot inflate cumulative score.
- English/Russian UI, high contrast, larger text, reduced motion and graphics quality options.
- Local preferences, file import/export, and same-tab reload recovery. A reloaded challenge resumes **paused**, preserving measured elapsed time.

Difficulty remains a saved future content-selection preference. Champion facts, taboo lists and actual clues are intentionally unavailable. Three Clues reveals slots without inventing character facts. Audio levels are persisted for future playback, which is not implemented yet.

## Control Mode and Stream Mode

Control Mode contains setup, settings and host actions. Stream Mode presents the stage, roulette, challenge, timer and results while hiding host buttons. Optional round/player labels and 0–8% safe margins support 16:9 capture. Capture the browser/PWA window in OBS; select a 1920×1080 or 2560×1440 browser/window size on the host device. The resolution setting is a **capture reference**, not a claim that browsers can resize their own windows.

Host shortcuts when an input or button is not focused:

| Key / gesture | Action |
| --- | --- |
| Enter | Primary action: setup, select, continue, challenge start/pause/resume, next round |
| Space | Challenge timer start/pause/resume |
| G | Finish a started challenge successfully |
| S | Skip the challenge |
| Escape | Close dialog, back, or return from Stream Mode to Control Mode |
| Tap presentation | Advance the current primary action |
| Two-finger tap presentation | Return to Control Mode on touch devices |
| Tab / Shift+Tab | Navigate controls; Enter/Space activate the focused button |

This is a **single-window** presentation/control system. It does not pretend to synchronize a separate OBS presentation window. Native fullscreen uses the browser Fullscreen API where available; Safari/iOS users can install the standalone app for an edge-to-edge view. OBS capture itself still needs verification on the streaming machine.

## PWA caching and updates

`vite-plugin-pwa` builds the manifest and an inject-manifest Workbox service worker. All app shell assets, fonts, icons and lazy screen/3D chunks are revisioned and precached. A failed install leaves the existing active worker usable. Navigation falls back to the cached app shell.

Updates **wait** for the user. A new-version banner explains that preferences and the session will be retained; the user chooses Update or Later. Network failures have retry/dismiss controls. Chunk-load failures show recovery UI instead of an endless loading state. Test coverage includes offline reload/navigation, an explicit update, preference retention, and a deliberately rejected worker installation followed by a successful offline reload.

## Performance strategy

- Screens and the Three.js scene are independently lazy loaded; the engine is not in the initial core bundle.
- The chamber uses procedural geometry, three-point lighting and a generated studio environment. No shadows, full-screen postprocessing, bloom renderer or external HDR/video downloads.
- Adaptive pixel ratio: 1.15 on touch/low-powered devices and at most 1.65 on richer configurations. Idle rendering targets 30 FPS; high-quality spin can render at 60 FPS. UI motion uses transforms/opacity; no full-screen mobile blur during roulette.
- Intersection and document visibility stop scene work. Reduced-motion stages freeze a self-rendered frame into a bitmap, then stop the animation loop. A brief initialization warmup completes shader/material rendering. This bitmap is generated from the procedural scene, not a character asset.
- Geometry, materials, environment targets, renderer contexts, observers, RAF handles, intervals and listeners are cleaned up on screen departure.
- The timer updates visible seconds only and measures elapsed time with `performance.now()` rather than trusting interval cadence.

60 FPS is a target, not a measured guarantee for every device. Physical iPhone/iPad performance and thermal/battery testing remain release-device checks.

## Tests and visual review

```sh
npx playwright install chromium webkit
npm test
npm run build
npm run test:e2e
```

Browser tests run the **production output**, not Vite's development transform. A test-only static server injects service-worker update failures; none of those endpoints are included in the shipped app.

The requested 375×812, 390×844, 430×932, 768×1024, 820×1180, 1024×1366 and 1920×1080 viewports are rendered in Chromium and WebKit. The suite also covers all challenge formats, result/settings layouts, motion/skip behavior, Russian large text, emulated iPhone touch/rotation, the full round/retry flow and PWA caching/update recovery. Screenshots live in `docs/pwa/screenshots/`. See `docs/pwa/VERIFICATION.md` for actual final results and limits.

## Free HTTPS deployment

The connected Sites workflow publishes only `dist/client/` under the Site identity in `.openai/hosting.json`. It is configured for public access so visitors do not need a ChatGPT account. The source history also contains the recoverable Flutter version; native binaries are not part of the static web deployment.

The same application can be deployed on free-tier **Cloudflare Pages** or another static HTTPS host with no backend:

1. Push this repository to your Git provider.
2. Connect it to Cloudflare Pages as a static site.
3. Set build command `npm run build`, output `dist/client`, and Node 22.12 or later.
4. Serve from the domain root. Keep `sw.js`, `index.html` and `manifest.webmanifest` revalidated rather than permanently cached. Fingerprinted `/assets/*` may be immutable.
5. Visit the resulting HTTPS URL once, verify offline readiness, and install from Safari.

Routing uses URL hashes, so no server-side routing backend is needed. Repository-subdirectory hosting requires adapting Vite base, asset paths, manifest scope/start URL and worker scope; the included configuration deliberately targets a root-hosted site. No API keys or environment secrets are required.

## Native preference migration

Browsers cannot access a macOS app's sandbox directly. To migrate an existing native preference file locally:

```sh
python3 tools/export_flutter_settings.py
```

Import the resulting `legacy-settings.export.json` through the PWA's Settings → Import. The file is Git-ignored and is never published. The importer also understands the original numeric mode/difficulty values. If no original preferences exist, the PWA already uses the same defaults.

## Ready for the next phase

`CharacterRepository`, `CameraService` and `AudioService` define the next integration boundaries. The full-body stage is ready for real transparent character renders. The camera dialog demonstrates 3:4, 16:9 and 1:1 composition without activating a device, and can later host mirrored front/rear previews and position controls. A future synchronized broadcast window can share the presentation model through an explicitly implemented transport rather than coupling views to the game engine.

Known limits: no real character catalog/images/clues; no camera capture or audio playback; no network multiplayer/accounts; no separate-window sync. Browser-engine/mobile emulation is not a physical-device or Safari Home Screen installation test. Windows browser behavior and OBS capture have not been tested on Windows hardware. Offline storage and fullscreen/install support remain subject to browser policies.
