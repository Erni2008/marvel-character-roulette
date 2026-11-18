# Reference comparison

Authoritative reference: user-supplied four-phone concept `/Users/erni/Desktop/image.png`. It is used as a visual target, never displayed/cropped as an interactive screen.

| Reference screen | Implemented reconstruction |
| --- | --- |
| Main menu | Silver italic two-line title, small optional original branding, tracked subtitle, original illustrated blue/red city and architectural focal point, angular red PLAY, three metallic navigation tiles. |
| Select Mode | Back button, centered italic heading/subtitle, two vertical angular panels, red card fan, blue/red tilted segmented wheel, real selection buttons. |
| Drawing Character | Original vault environment, blue shaft, red circular platform, floating textured collectible card, multi-card CSS 3D shuffle, rotating energy trails, actual timeline progress and flip/reveal. |
| Guess | Angular round plate, vertical red frame, neutral full-body silhouette/question mark, two-line title, segmented illuminated countdown, blue Skip/green Correct/silver Next. |

Actual Chromium/WebKit captures are under `screenshots/`; the normal-motion card and wheel are captured mid-sequence. Phone screenshots deliberately omit a fake iPhone bezel/status bar/Dynamic Island: the real device supplies these. Safe-area insets are honored.

The first render was inspected against the reference. Corrections included widening title typography, strengthening red emissive frames, correcting SVG wheel emblem specificity/position, moving the gameplay card upward and balancing title/card/timer proportions. Subsequent phone, tablet, desktop and landscape screenshots were rendered and inspected. See VERIFICATION.md for the tests actually executed.

## Fidelity limits

This is a reconstruction, **not a pixel-perfect claim**. The concept contains hand-painted materials, a Marvel/Avengers logo and a branded architectural scene. Those exact assets were not supplied for reuse and the brief forbids hardcoded copyrighted logos. Two original local environment artworks and an original lightning/diamond emblem replace that imagery. Geometry, text, controls, timers, card faces and wheel are actual SVG/HTML/CSS components, not concept-image cutouts. Surface texture, lighting and silhouettes differ from the painted concept; CSS 3D is not a physically rendered 3D scene. No Marvel character art has been created or downloaded.

Tablet and desktop use dedicated compositions rather than stretching the phone. Test screenshots demonstrate browser rendering; they do not certify physical iPhone/iPad installation, thermal performance, 60 FPS on every device or actual OBS capture.
