# Change map

- `src/app/{App,Store}.tsx`: core flow/navigation, dialogs, key handling, versioned session/statistics, catalog loading, guarded submissions.
- `src/domain/{game,settings}.ts`: generic character model, separate selection/trajectory/state logic, preferences migration/validation.
- `src/components/{Cinematic,ScreenTransition}.tsx`: reusable angular SVG materials, tactile buttons, cards, timer, wheel, atmosphere and transitions.
- `src/hooks/useSelectionSequence.ts`: independent Card Draw and Roulette choreography; existing `useCountdown` and `usePWA` lifecycle reused.
- `src/screens/{Home,SelectMode,Selection,Guess,Settings,Stats,Summary}.tsx`: rebuilt presentation and functional controls.
- `src/styles/index.css`: reference-focused phone/tablet/desktop design, Safari text fix, safe areas, stream-safe framing, reduced graphics/motion.
- `public/art/`, `assets/reference-art/`, `public/fonts/Exo2*`, `public/icons/`: original local environments, source originals, licensed typography, original emblem/icons.
- `public/characters/{manifest.json,README.md}`: configurable local PNG catalog and future full-body artwork instructions.
- `src/sw.ts`, `vite.config.ts`, `index.html`: versioned offline shell, controlled future PNG cache, manifest metadata, local font preload.
- `tests/`, `playwright.config.ts`, `tools/write_verification.mjs`: domain/timer tests, production browser and offline/update tests, actual visual matrix/report.
- `legacy/react-v2/`: recoverable previous React presentation/domain. Tags preserve earlier React and Flutter source.
- `README.md`, `docs/reference/`: run/build/deployment instructions, architecture, migration, provenance, screenshots, visual comparison and verification limits.

Old active Stage/UI/ChamberScene and Setup/Roulette/Challenge/Result/Menu modules were replaced by the flow above; they remain in the legacy archive and Git history. Native Flutter platforms were preserved.
