# Migration plan and audit

Original architecture: Flutter screens and procedural painters in `lib/ui`, application controller in `lib/app`, game rules in `lib/domain/game.dart`, versioned native preferences in `lib/core/settings.dart`. No existing React code or Git repository was present.

Before implementation, the complete original source and macOS archive were committed as `3a91014` and tagged `flutter-phase-one`. Restore it with `git worktree add ../roulette-flutter flutter-phase-one`. The Flutter directories also remain in this repository. Original instructions are in `docs/FLUTTER-ORIGINAL.md`.

Incremental migration:
1. Preserve native source; record game and preference semantics.
2. Port domain types, mode pools, selection, scoring and player/round progression into pure TypeScript.
3. Establish responsive materials, typography, motion and navigation primitives.
4. Build the menu and adaptive Three.js selection chamber, with an SVG fallback.
5. Connect setup, roulette timeline, all challenges, countdown, results and settings.
6. Add installable PWA shell, offline cache, explicit update handling and recovery.
7. Validate domain logic, browser flow, responsive renders, offline behavior and production build; publish static HTTPS output.

Native shared preferences are sandboxed from browsers. The PWA understands the original JSON schema, including numeric mode/difficulty values, and offers local import/export. It does not claim automatic access to macOS preferences. Defaults and game rules are preserved; native fullscreen becomes the browser Fullscreen API when available. Browser windows cannot be arbitrarily resized, so resolution settings are capture references rather than promises to resize Safari.

The UI state and game session are distinct from presentation. Stream Mode is a clean view in the same window, not an unimplemented synchronized second window. It can be controlled using documented host keyboard shortcuts or returned to Control Mode. No backend or paid runtime service is required.
