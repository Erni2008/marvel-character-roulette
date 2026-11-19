# Interior presentation rebuild

The accepted home screen is retained. This pass replaces the accumulated interior visual overrides with `src/styles/interior.css`; `refinement.css` and `shuffle.css` remain recoverable in the repository but are no longer imported.

## Concrete changes

- Replaced simulated chrome/italic title effects with a consistent Display/Studio typography pair: locally licensed Roboto Condensed and Manrope. Body copy, button labels, timer numerals and character names share a clearer hierarchy.
- Removed the faceless mannequin, lightning emblems, ornamental energy trails, particles, repeated emissive frames, phase labels and fictional technical metadata from interior screens.
- Designed a new original vector card back: fine double borders, a restrained CR wordmark, guilloche geometry, micro-pattern and directional foil highlights. The card has a thin layered stock edge instead of a large neon chassis.
- Empty character artwork is now an intentional question-mark plate. Actual local PNGs still use full-body `contain`; no character illustration was generated or downloaded.
- Rebuilt mode selection, gameplay composition, controls, result feedback, settings, statistics and dialogs with the same graphite surfaces, crimson primary action and subdued success tone. The 40 English/Russian named answers remain prominent and persistent.
- Kept the seven-card/two-cut shuffle and deterministic roulette. Only the visual surfaces changed; no random selection is driven by animation frames.
- Fixed the entry timer race when the round menu opens immediately: the clock stays paused behind the dialog and after returning.

## Visual review

Actual Chromium/WebKit phone screenshots, utility pages, card motion phases, desktop and tablet layouts were rendered and inspected. Review found a legacy absolute-positioned back button overlapping a utility heading and unequal desktop illustration alignment. The final stylesheet fixes both; the relevant utility/widescreen scenarios are rerun after that CSS build.

The home screenshot is compared separately at 390×844 reduced motion. Current executed results are in [VERIFICATION.md](VERIFICATION.md). A curated capture set is tracked under `screenshots/`; the larger matrix is reproducible through Playwright.

This is a different, deliberately quieter interior treatment. Visual quality remains a design judgment; passing automated tests is not a claim of pixel-perfect fidelity or professional endorsement. The original four-phone concept remains in the earlier comparison documentation. The accepted original home artwork and existing PWA icon are retained. No new generated bitmap assets or external assets were introduced.

## Architecture and scope

`Cinematic.tsx` contains original code-native deck engraving and the unknown-artwork plate. `SelectMode.tsx`, `Selection.tsx`, `Guess.tsx` and `main.tsx` connect the new presentation while preserving navigation, named catalog, storage and PWA behavior. `GameSession`, roulette math, seven-card choreography, countdown implementation, character data and PNG loading remain separate.

Physical iPhone/iPad installation, Windows hardware, real OBS capture and device-level FPS/battery measurements were not performed. The current verification is browser rendering and touch emulation on macOS.
