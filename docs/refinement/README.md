# Interior-screen refinement

The accepted main menu is preserved. Scope: selection modes, collectible cards, independent Card Draw/Roulette sequences, gameplay, results, statistics and settings.

## Art direction changes

- Replaced thick uniformly emissive interior edges with thinner titanium borders, a recessed optical line and localized reflections. Kept the original palette and angular silhouettes.
- Built etched card details, directional metal surfaces, hardware clips and a collection seal as real SVG/CSS. No image-generation step or character artwork was added in this pass.
- Replaced the flat placeholder silhouette with an original neutral full-body faceless display mannequin. Future PNG rendering still uses centered `object-fit: contain` and the full vertical stage.
- Made the mode panels more distinct through their actual focal objects, specimen labels, layered material and coordinated touch activation. Descriptions remain functional text.
- Recessed the wheel sectors, added radial tooling/reflection and restrained its blue/red illumination. Selection math and actual winning sector remain separate from appearance.
- Rechoreographed the card rise/shuffle/rest/flip. Fixed an opacity-composited 3D ghost group intersecting the hero card by placing the group behind it. Reduced-motion selection and skip remain available.
- Redesigned the countdown as a fine segmented instrument dial. Its illuminated ring now decreases with actual remaining time. Pause/resume, monotonic timing and restoration are retained.
- Added actual round-progress marks and a tappable round plate that pauses and opens the game menu. This also makes leaving a Stream Mode session possible on a standalone touch device.
- Added a restrained full-card result seal and actual per-round session recap. Correct/Skip/Next semantics and duplicate-submission guards are unchanged.
- Replaced repeated giant neon settings/statistics frames with quieter equipment panels, thinner rules, numbered sections and custom range controls.

## Source boundaries

The new presentation layer is isolated in `src/styles/refinement.css`, imported after the original stylesheet. Home has no matching refinement selectors for its surfaces or typography. Shared SVG primitives gained named material layers; their original Home appearance is retained. No game-domain, character-catalog, external-service or camera permissions changes were needed.

Changed components: `Cinematic.tsx`, `SelectMode.tsx`, `Selection.tsx`, `Guess.tsx`, `Settings.tsx`, `Summary.tsx`, `useSelectionSequence.ts`, and the new style entry. Existing tests were expanded for the new touch-accessible round menu and result captures.

## Visual review

Actual local Chromium/WebKit screenshots live in `screenshots/`. The first review exposed description wrapping and 3D layer intersections; both were corrected. The 390×844 reduced-motion Home screenshot was compared with the previous tracked capture using Pillow: the image difference was empty (no changed pixels). This statement applies to that representative capture, not a universal pixel-perfect claim across devices.

Original city/vault artwork, icons, character restrictions and PWA architecture remain in place. See [previous asset provenance](../reference/ASSETS.md). Current verification is recorded in [VERIFICATION.md](VERIFICATION.md).

No physical iPhone/iPad, Windows device or actual OBS capture was available for certification. Graphics are SVG/CSS/Motion; no decorative WebGL loop was added. Browser emulation is not a device-level FPS or battery benchmark.
