# Physical card shuffle and named answers

The Card Draw presentation now uses seven independently composited cards. The timeline is a pure function in `src/domain/shuffle.ts`: stack lift → fan → packet cut → staggered interleave → second cut/interleave → collection → one-card flip. Cards change actual visible stack order during the two cuts. The chosen answer is still sampled exactly once before the animation; choreography never determines game state.

Motion is 4.6 seconds plus the existing short reveal hold. Each card has independent MotionValues for position, yaw, in-plane rotation, scale, opacity and layer. There is no per-frame React render. The selected paper face switches once at the edge-on midpoint of its flip; this avoids back-face leakage in browser compositing. Bounded seven-card rendering, visibility pause, skip, controller cleanup and reduced-motion behavior remain supported. Roulette is a separate unchanged animation using the actual catalog size.

## Named characters

`public/characters/manifest.json` now contains **40 text-only character names** with English `name` and optional Russian `nameRu`. No images, facts, copyrighted logos, external character API or asset downloads were added. This is a manually curated starter list, not a complete or version-verified MCOC roster.

The selected localized name is shown on the face of the card and, prominently, in an **Answer for verification / Ответ для проверки** plate during gameplay. Russian mode also shows the English name below it. The plate remains visible after Correct and in Stream Mode; the guesser must still look away. Correct/Skip/Next are human-operated adjudication controls; no speech recognition or automatic interpretation of spoken guesses is implied.

Custom catalog entries without `nameRu` display their existing `name` in either language. Full-body PNG handling is unchanged. A bundled copy of the same text catalog is available if loading a local override fails. Active legacy generic CHAMPION placeholder sessions are upgraded to a named starter entry; previously recorded rounds and statistics are retained.

## Verification

Domain tests cover packet separation, changing front-card order, final single-card reveal, bounded/continuous visible trajectories, optional localized names and the bundled named catalog. Browser tests verify named-answer consistency with session state, seven distinct live transforms/order changes, roulette stopping against the actual entry count, Russian touch presentation, PNG fallback and existing PWA/gameplay flows. Actual rendered review captures are in `screenshots/`; the full responsive matrix is generated in `docs/refinement/screenshots/`.

See [executed results](VERIFICATION.md). Physical device FPS, Safari Home Screen installation, Windows hardware and actual OBS capture remain outside the local browser verification scope.
