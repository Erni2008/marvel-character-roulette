# Marvel Character Roulette

An independent Flutter desktop application with a cinematic procedural stage, local session flow and no character assets or network integrations. Phase one is a complete interactive UI and game-flow foundation.

## Launch on this Mac

The SDK installed for this project is **Flutter 3.50.0 stable / Dart 3.14.0** at `/Users/erni/development/flutter`.

```sh
cd /Users/erni/marvel_character_roulette
/Users/erni/development/flutter/bin/flutter pub get
/Users/erni/development/flutter/bin/flutter run -d macos
```

For the optimized app:

```sh
/Users/erni/development/flutter/bin/flutter build macos --release
open "build/macos/Build/Products/Release/Marvel Character Roulette.app"
```

The release application can also be opened directly from Finder. It is a local development build, not a notarized distribution package.

## Windows

On a Windows machine, install Flutter stable 3.50 or later and Visual Studio with **Desktop development with C++**, then:

```powershell
cd marvel_character_roulette
flutter pub get
flutter run -d windows
flutter build windows --release
```

Distribute the complete `build/windows/x64/runner/Release` directory, including its DLLs and `data` directory. Windows runners and native window management are included. **Windows has not been compiled or run in this macOS environment.**

Android and iOS runners are included for future development. The widgets adapt to narrow layouts, but neither mobile platform has been built, device-tested, or supplied with native camera functionality.

## Included experience

- Skippable two-second procedural splash and animated cinematic menu.
- Three modes: Party, Knowledge and Chaos, each with an appropriate challenge pool.
- Persistent setup: 1–10 players, five time presets, finite/unlimited rounds, difficulty, language and presentation mode.
- A 4.2-second roulette with an acceleration ramp, cubic deceleration, changing ID cards, blur, light sweep, shake and reveal. Reduced motion uses a short 0.8-second selection with the spatial effects disabled.
- 120 local placeholder champion IDs, independent of the roulette renderer.
- Eight challenge definitions, including a three-slot clue interaction and randomly selected chaos restrictions.
- Start, pause/resume, skip, finish, timeout failure, retry, round progression, player rotation and finite-session completion.
- Monotonic countdown with a five-second override for Speed Guess. The timer pauses when the app loses activity or the leave-session dialog opens.
- Round and cumulative scores: a successful round earns `100 + 5 × seconds remaining`. Skip and timeout earn zero. Retry replaces the previous attempt instead of inflating the total.
- English and Russian interface copy, bundled Cyrillic-capable Roboto Condensed headings, local settings, custom desktop icon, hover/focus feedback and keyboard operation.
- Display, audio-level, gameplay, language, accessibility and streaming settings. Audio levels are saved for future playback integration.

Champion facts, taboo words and clue content are explicitly unavailable. The app does not invent facts about placeholder IDs. Difficulty is a saved session preference reserved for future content selection. There are no character images, character downloads, APIs, webcam access, accounts, servers or networking.

## Keyboard and navigation

- **Tab / Shift+Tab:** move focus. **Enter / Space:** activate a focused button.
- The primary button receives initial focus on each screen. Enter and Space activate it.
- With the challenge’s primary button focused, **Space** starts or pauses/resumes the timer.
- **Escape:** back. Leaving an active session opens a confirmation and pauses its timer.
- With overlays hidden, **Escape** remains available and **Host controls** exposes finish/skip.

## OBS and presentation

1. Select **Stream Mode** in setup or settings.
2. Set a 1920 × 1080 or 2560 × 1440 resolution preference and apply the window size. The OS may limit an oversized window to the connected display's available desktop area.
3. Select Windowed, Fullscreen, or Borderless fullscreen. macOS uses native fullscreen with a hidden title bar for the borderless option; Windows uses a frameless fullscreen window.
4. In OBS, add Window Capture or Display Capture and select this application's window/display. No transparent-window compositing is required.
5. Hide interface overlays for clean presentation and adjust safe margins from 0–8%.

The Stream Mode challenge view keeps the full-body stage, challenge title and countdown visible together. Nonessential menus and setup panels are omitted. A camera composition placeholder is visible in the standard roulette sidebar; it never opens a camera or requests permission.

1920 × 1080 is the presentation reference and 2560 × 1440 is covered by layout tests. Native window resizing, fullscreen variants, multi-monitor behavior and OBS capture should also receive manual verification on each release machine. **OBS itself has not been tested here.** Animations target 60 FPS; a hardware frame-rate benchmark has not been performed.

## Architecture

```text
lib/
  main.dart                 initialization and dependency bootstrap
  app/
    application.dart        app theme, localization, navigation, keyboard shell
    controller.dart         application and session orchestration
  core/settings.dart        validated, versioned local preferences
  domain/game.dart          champion model/repository, selection, challenges, session
  services/
    desktop.dart            native window behavior (desktop guarded)
    future_services.dart    CameraService / AudioService contracts only
  ui/
    design.dart             palette, type, buttons, panels, procedural painters
    motion.dart             independent roulette motion profile
    screens/                seven responsive screens and their animation lifecycles
```

`CharacterRepository` is the replacement boundary for a future real champion catalog. `RouletteSelector` selects a winner before the visual animation begins. `ChallengeEngine` owns the mode-specific challenge pools. `GameSession` owns rounds, players and scores. Camera and audio interfaces have **no fake implementations** and are never instantiated in phase one.

All animation controllers and timers are disposed. Ambient and stage painting are isolated with repaint boundaries, and background motion stops when the application becomes inactive. The countdown uses an injectable monotonic clock for deterministic tests.

Preferences use `shared_preferences` under the `settings.v1` key in the platform's application preferences store. Session scores are intentionally in-memory. Invalid settings fall back to defaults; write failures are surfaced in the interface.

## Verification

```sh
flutter analyze
flutter test --reporter expanded
flutter test integration_test/desktop_smoke_test.dart -d macos --reporter expanded
flutter build macos --release
```

The test suite covers selection bounds/exclusions, all eight challenge definitions, persistence and corrupt settings, the full game flow, pause/resume, success/retry/timeout, and every screen at 390, 800, 1440 and 2560 logical-pixel widths in English and Russian. It also exercises Stream Mode, hidden overlays, high contrast and combined larger text/UI scaling.

The macOS integration test uses native window and preferences plugins, plays the full roulette animation, traverses the game flow, checks real preferences round-trip, and renders QA screenshots into the sandbox's temporary directory. It restores the previous settings value afterward. Native computer-use inspection was unavailable, so rendered Flutter screenshots and native integration tests provide the runtime verification.

`docs/VERIFICATION.md` records the final checks and platform limits. `docs/screenshots/` contains the reviewed macOS Flutter render captures.

## Assets and licensing

No Marvel imagery is bundled. The geometric emblem, silhouette and stage are programmatic. Roboto Condensed is bundled under the SIL Open Font License; see `assets/fonts/OFL.txt`. `tools/generate_icons.py` regenerates the native geometric icons and requires Pillow only when regenerating them. Normal Flutter builds do not require Python.
