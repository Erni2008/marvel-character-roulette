# Audit and rebuild plan

The starting repository was already a React/TypeScript/Vite PWA, with the earlier Flutter desktop source retained. Active presentation used a different cinematic chamber, seven screens and eight challenge formats. Relevant existing functionality: monotonic countdown, local preferences, tab-scoped sessions, PWA worker/update handling, keyboard patterns and an existing public static hosting project.

Before rebuilding, the React version was tagged `react-cinematic-v2` and active source copied under `legacy/react-v2/`. The original Flutter implementation remains recoverable via `flutter-phase-one`. The hosting project and public URL were preserved.

Implementation followed the latest reference brief incrementally:

1. Define reference palette, local cinematic typography, original environment assets, angular SVG material/frame/button primitives.
2. Reconstruct menu and two-option mode selection.
3. Separate game state/random selection from independent card-shuffle and deterministic wheel timelines.
4. Implement shared guessing presentation, monotonic timer, round submission guards, next/skip/correct and finite summary/statistics.
5. Migrate applicable preferences; provide validated settings import/export, English/Russian, graphics/accessibility and single-window stream presentation.
6. Adapt phone, tablet, landscape and widescreen compositions; reserve contained full-body PNG stages.
7. Keep PWA lifecycle, expand precache to original art/catalog/screens, bound future PNG runtime cache.
8. Render and inspect browser screenshots; test domain/timer and complete production flows in Chromium/WebKit; fix observed layout/Safari defects before publication.

The active trivia/roleplay/knowledge/chaos challenge UI was removed intentionally: the latest request explicitly narrows gameplay to Card Draw or Roulette followed by shared character guessing. Those old features are preserved in the tag/archive, not silently deleted. Old incompatible challenge sessions are not migrated into the new round state machine. Settings keys are versioned v3; applicable v2/Flutter preferences migrate. Default duration becomes 60 seconds, session length 10 rounds.

No character images, Marvel assets/logos, external character APIs, camera access, backend, networking or paid dependencies/services were added.
