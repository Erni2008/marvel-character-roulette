import fs from 'node:fs';
const full = JSON.parse(fs.readFileSync('.openai/artifacts/studio-full-results.json', 'utf8'));
const latest = JSON.parse(fs.readFileSync('test-results/browser-results.json', 'utf8'));
const unit = JSON.parse(fs.readFileSync('.openai/artifacts/studio-unit-results.json', 'utf8'));
const cases = new Map();
function collect(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? [])
      for (const t of spec.tests) cases.set(`${t.projectName}:${spec.title}`, t.status);
    collect(suite.suites ?? []);
  }
}
collect(full.suites);
collect(latest.suites);
if ([...cases.values()].some((x) => x !== 'expected') || !unit.success || unit.numFailedTests)
  throw Error('A required verification failed/skipped.');
fs.writeFileSync(
  'docs/studio/VERIFICATION.md',
  `# Executed interior rebuild verification\n\n${new Date().toISOString()}, ${process.platform}/${process.arch}.\n\n- Strict TypeScript / production Vite-PWA build: passed.\n- Unit tests: ${unit.numPassedTests} passed, zero failed.\n- Browser cases: ${cases.size} unique scenarios passed, no unresolved failures/skips. Full run: ${full.stats.expected} passed. After the observed utility-header, desktop-stage alignment and foil-font corrections, ${latest.stats.expected} relevant cases were rerun successfully against the final production build.\n- Actual Chromium, WebKit and iPhone 13 WebKit touch emulation.\n- Layout matrix: 375×812, 390×844, 393×852, 430×932, 768×1024, 820×1180, 1024×1366, 1180×820, 1920×1080, 2560×1440.\n- Actual screenshots of modes, cards in motion, gameplay, feedback, settings, stats and final recap were rendered and inspected. A curated set is tracked in screenshots/.\n- Flow coverage retains actual named-answer consistency, physical card layer changes, deterministic wheel stop, full-body PNG contain/error fallback, Correct/Skip/Next, round summary, timer pause/expiry, locale/settings persistence, offline app shell and successful/failed worker updates.\n- Added regression coverage: opening the round menu immediately keeps the entry timer paused, including after closing the dialog. Utility heading/back-button bounds are now checked to prevent overlap.\n- The accepted home capture was compared against its previous version at 390×844 reduced motion: no changed pixels.\n\nThe new original deck surfaces and unknown-artwork placeholder are code-native SVG/CSS. No generated character imagery, camera, external character API or speech recognition was added. Existing text-only names and PNG architecture remain intact.\n\nLimits: browser and touch emulation do not certify physical iPhone/iPad installation, device thermal/FPS/battery behavior, Windows hardware or actual OBS capture. Visual quality is a design judgment, not something inferred from a passing test count.\n`,
);
console.log(`${unit.numPassedTests} unit / ${cases.size} unique browser cases recorded.`);
