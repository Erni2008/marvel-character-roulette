# Character Roulette — reference rebuild

An installable, offline React game with two genuinely different selection sequences: **Card Draw** (3D shuffle/flip) and **Roulette** (deterministic segmented wheel). Both lead to the same shared guessing screen. The guesser looks away; participants and OBS see the character and its name.

## Run

Node **22.12+**, npm:

```sh
npm ci
npm run dev
```

Open the printed localhost URL. Production:

```sh
npm run build
npm run preview -- --port 4173
```

`dist/client/` is the complete static deployment. No backend, account, camera permission, paid API or character download is required.

## Validate

```sh
npm test
npm run typecheck
npx playwright install chromium webkit
npm run test:e2e
```

Browser tests build on the production output, so run `npm run build` first. The test-only host uses port **4174**. Screenshots are written to `docs/reference/screenshots/`. See [actual verification](docs/reference/VERIFICATION.md), [visual comparison](docs/reference/VISUAL-COMPARISON.md), and [art provenance](docs/reference/ASSETS.md).

## Architecture

- `src/domain/game.ts`: character model/catalog validation, random selection, wheel trajectory math, idempotent round state machine, statistics, future service interfaces.
- `src/domain/settings.ts`: validated versioned preferences, migration from compatible v2/Flutter settings.
- `src/app/Store.tsx`: navigation, session persistence, catalog loading, synchronous submission guards and local statistics.
- `src/components/Cinematic.tsx`: real SVG beveled frames, metallic buttons, full-body cards, wheel, timer, atmospheric layers.
- `src/hooks/useSelectionSequence.ts`: one bounded RAF timeline; winner fixed before motion, background visibility pause, independent card/wheel choreography, reduced-motion path, cleanup.
- `src/hooks/useCountdown.ts`: monotonic elapsed time, pause/resume and navigation/update persistence. Callback counts do not determine time.
- `src/screens/`: Home → SelectMode → Selection → Guess → Summary, plus functional Settings and Stats.
- `src/sw.ts`, `src/hooks/usePWA.ts`: offline shell, versioned caching, explicit update with round pause, recovery after a failed worker installation.
- `src/styles/index.css`: local Exo 2 typography, material/motion tokens, phone/tablet/widescreen compositions, safe areas, low graphics and reduced motion.

No WebGL loop is needed for these assets: SVG, CSS 3D and Motion provide the depth without loading Three.js into the app bundle. Screens are lazy-loaded, then precached for offline navigation. Art assets total about 220 KB. Decorative particles are bounded to six. Hidden documents pause environmental CSS motion and the selection RAF.

## Game controls

Default: 10 rounds, 60 seconds. Configure rounds, duration, language, graphics and accessibility in Settings. Correct locks a successful result; Next advances. Skip records a skip and advances immediately. Next on an unanswered round records a pass. Timeout records failure and waits for Next. Duplicate submissions are rejected by session/round token. Statistics persist locally; the active session is tab-scoped.

Touch the timer to pause/resume. Keyboard: Space pauses, G marks correct, S skips, Enter performs the current primary action, Escape returns/opens a leave confirmation. Essential controls are real focusable buttons. Stream Mode hides settings/admin affordances while keeping the single shared presentation and essential game controls. It is **not** a synchronized second window.

## Add characters later

See [public/characters/README.md](public/characters/README.md). The shipped catalog contains only generic placeholders, no real names or character artwork. Transparent PNGs use `object-fit: contain` in a vertical stage; heads and feet are retained. Invalid/missing PNGs fall back to the neutral question-mark stage.

## Free HTTPS hosting and installation

Upload **contents of `dist/client/`** to a free static host such as Cloudflare Pages or Netlify (build `npm run build`, output `dist/client`; Node 22.12+). Vite base is `/`. Hash navigation needs no server route rewrites. Keep `sw.js`, manifest, icons, `assets/`, `art/`, fonts and catalog together. Use HTTPS; localhost is the development exception. Do not cache `sw.js` indefinitely at the CDN. No server secrets or environment variables are required.

On iPhone/iPad, open the HTTPS link in **Safari → Share → Add to Home Screen**. Open the installed icon once online to complete caching. The shell, typography, environments and placeholders then work offline. Added character PNGs are cached only after they are displayed (bounded to 40 images), so unviewed art needs network. When a new version is ready, **UPDATE** pauses/saves the round before activating the worker; **Later** retains the running version. A failed install leaves the old worker/cache available. Local settings/session values survive successful shell updates.

## Preservation and scope

The existing React application was audited before editing. Reused: monotonic timer, PWA update lifecycle, validated persistent settings approach, native Flutter source and hosting identity. Old React presentation/domain are recoverable in `legacy/react-v2/` and Git tag `react-cinematic-v2`; original Flutter is tagged `flutter-phase-one`. The active UI intentionally removes trivia/roleplay/challenge formats because the latest brief specifies the simpler Card Draw/Roulette guessing flow. Existing relevant preferences migrate; incompatible old challenge sessions do not.

Future work: local character collection expansion, a real camera composition service, optional audio playback and physical-device performance tuning. Camera and audio interfaces/preferences are scaffolding only; they do not pretend to capture/play media. Mobile Safari installation, Windows hardware, native fullscreen and actual OBS capture require device validation; emulated browser results are documented separately.
