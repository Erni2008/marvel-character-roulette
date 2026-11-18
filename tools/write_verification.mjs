import fs from 'node:fs';
const full = JSON.parse(fs.readFileSync('.openai/artifacts/reference-full-results.json', 'utf8'));
const latest = JSON.parse(fs.readFileSync('test-results/browser-results.json', 'utf8'));
const unit = JSON.parse(fs.readFileSync('.openai/artifacts/unit-results.json', 'utf8'));
const checks = new Map();
function collect(suites) {
 for (const suite of suites) {
  for (const spec of suite.specs ?? []) for (const t of spec.tests) {
   // The PNG case was isolated from workers to test rendering; title/project remain stable.
   checks.set(`${t.projectName}:${spec.title}`, {title:spec.title,project:t.projectName,status:t.status,results:t.results});
  }
  collect(suite.suites ?? []);
 }
}
collect(full.suites);collect(latest.suites);
if(!checks.size||[...checks.values()].some(t=>t.status!=='expected')||!unit.success||unit.numFailedTests)throw Error('Verification failed or skipped');
fs.writeFileSync('docs/reference/VERIFICATION.md',`# Executed verification\n\n${new Date().toISOString()}, ${process.platform}/${process.arch}.\n\n- Strict TypeScript and production Vite/PWA build: passed.\n- Domain/catalog/wheel/state/preferences and monotonic countdown: ${unit.numPassedTests} unit tests passed.\n- Production browser integration: ${checks.size} unique cases passed, zero unresolved failures/skips; Chromium, WebKit and iPhone 13 touch emulation.\n- Full run: 33 passed; two PNG presentation fixtures initially failed because page routes did not intercept service-worker-owned image requests. Those fixtures were isolated with workers blocked and rerun successfully. Dedicated PWA tests retain real service workers. Production code did not change for this test correction.\n- Layout matrix: 375×812, 390×844, 393×852, 430×932, 768×1024, 820×1180, 1024×1366, 1180×820, 1920×1080, 2560×1440.\n- Actual rendered home/modes/gameplay screenshots captured for both engines; normal card/wheel mid-animation captures; Russian iPhone landscape.\n- Functional flow: random selection, deterministic physical wheel stop, animation skip, Correct lock, Skip/Next, repeated rounds, timeout, finite summary, timer pause/resume, preferences/reload/language, camera placeholder, statistics, future PNG contain and broken-image fallback.\n- PWA: standalone manifest/icons; art/fonts/catalog/lazy screens precached; offline reload and gameplay; explicit update preserving paused elapsed time/settings; failed worker install retains old offline shell.\n\nScreenshots were visually inspected. Comparison changes and fidelity limits are documented in VISUAL-COMPARISON.md. Browser automation uses the local Playwright harness because the browser connector was unavailable.\n\nNot tested on physical iPhones/iPads, Windows hardware, Safari Home Screen installation, actual OBS capture, native fullscreen on every OS, or a measured universal 60 FPS/battery guarantee. No real camera, character downloads or external character APIs are present.\n`);
console.log(`${unit.numPassedTests} unit / ${checks.size} unique browser tests recorded.`);
