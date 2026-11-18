# Production verification

Executed 2026-11-18T20:19:09.052Z on darwin/arm64.

| Check | Actual result |
| --- | --- |
| Strict TypeScript / production Vite build | Passed |
| Domain and monotonic timer unit tests | 7 passed |
| Production-browser integration tests | 31 passed, 0 failed, 0 skipped |
| Browser engines | Chromium and WebKit |
| Mobile emulation | iPhone 13 WebKit: Russian, larger text, touch, rotation, two-finger presentation exit |
| PWA | Manifest/icons, complete shell cache, offline reload/navigation, explicit update, preserved preferences and failed-install recovery |
| Graphics fallback | Full round remains functional with WebGL deliberately disabled |

The suite renders the seven requested viewport sizes: 375×812, 390×844, 430×932, 768×1024, 820×1180, 1024×1366 and 1920×1080. It captures all eight challenge formats, setup, roulette, results and settings; checks horizontal overflow; exercises live-motion selection and skip; tests the full pause/resume/success/retry/failure flow; and verifies clean presentation controls.

Rendered images were visually inspected in the workspace, including phone, tablet, desktop, live 3D and reduced-motion composition, challenge and result views. Visual defects found during review were fixed, including demand-rendered canvas presentation and controls overlapping the full-body stage. A curated set is tracked in docs/pwa/screenshots; the full generated matrix remains local and is reproducible.

The browser connector was unavailable, so the application was rendered through the project's Playwright harness. These are actual browser screenshots, not design mockups.

Limits: browser-engine and touch emulation do not certify a physical iPhone/iPad, Safari Home Screen installation, device thermal/battery behavior or a universal 60 FPS rate. Windows hardware and actual OBS capture were not tested. Native fullscreen behavior and install/update behavior should also be checked on release devices. Stream Mode is a single-window view, not synchronized separate windows. The hosted app contains no character downloads, real camera capture, API credentials or backend service.
