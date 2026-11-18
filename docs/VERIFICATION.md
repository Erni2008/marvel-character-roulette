# Phase-one verification

Verified on 18 November 2026 on an Apple Silicon Mac with Xcode 26.4.1, Flutter 3.50.0 stable and Dart 3.14.0.

| Check | Result |
| --- | --- |
| `flutter analyze` | Passed, no issues |
| `flutter test --reporter expanded` | Passed, 6 tests |
| Native macOS integration test | Passed, 1 test; complete game flow and native preferences |
| `flutter build macos --release` | Passed; optimized local application produced |
| Visual review | Reviewed native Flutter render captures of menu, setup, roulette, challenge, result and Russian Stream Mode |
| Responsive matrix | 312 screen/challenge combinations; 4 sizes × 2 languages × 3 display/accessibility configurations × 13 views |
| Keyboard | Focused secondary Settings button, Enter activation, Escape back and Space activation verified |
| Windows | Runner included; build and runtime not tested on this Mac |
| Android / iOS | Future runners included; neither built nor device-tested |
| OBS | Presentation layouts implemented; OBS capture not tested |
| 60 FPS | Design target; hardware frame-time benchmark not performed |

The widget suite covers selection bounds and avoiding a previous champion, all eight generated challenge definitions, valid/corrupt preference data, setup-to-result navigation, spinning, start/pause/resume, success, retry and timeout failure. Countdown tests use an injected monotonic clock rather than waiting in real time.

The layout matrix includes 390 × 844, 800 × 600, 1440 × 900 and 2560 × 1440 logical-pixel viewports; English/Russian; standard presentation; Stream Mode; hidden overlays; high contrast; and combined 120% UI scale with larger text. Font rendering and plugins receive additional native macOS coverage.

The native test uses real `window_manager` and `shared_preferences` plugins, runs the full 4.2-second roulette animation, captures the rendered screens, and restores the prior saved settings. Its initial window was constrained by the connected desktop to approximately 1440 × 800 logical pixels. The test runner reported that it could not foreground the app, but it successfully ran the native application, drove its Flutter UI, produced the captures and completed all assertions. Interactive computer-use access to the app was unavailable.

`docs/screenshots/` contains the final render captures. These are application render-tree screenshots rather than OS desktop screenshots.

Manual release-machine checks still needed: native fullscreen/borderless transitions, multi-monitor placement, OBS Window Capture/Display Capture, Windows native behavior, and sustained frame-time profiling. The release app is locally built and not notarized for public distribution.
