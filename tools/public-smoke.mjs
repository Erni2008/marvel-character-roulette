import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const url = process.argv[2];
if (!url?.startsWith('https://')) throw Error('Provide the deployed HTTPS URL.');
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(url);
  if (response?.status() !== 200) throw Error(`HTTPS status ${response?.status()}`);
  await page.getByRole('button', { name: 'PLAY', exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const manifest = await page.evaluate(
    async () => await (await fetch('/manifest.webmanifest')).json(),
  );
  if (manifest.display !== 'standalone') throw Error('Manifest is not standalone.');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.screenshot({ path: 'docs/refinement/screenshots/public-home-390.png' });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'PLAY', exact: true }).click();
  await page.locator('.mode-card-draw').click();
  await page.locator('.guess-screen').waitFor();
  await page.getByRole('button', { name: 'Correct answer', exact: true }).click();
  await page.getByText('CORRECT!', { exact: true }).waitFor();
  await page.screenshot({ path: 'docs/refinement/screenshots/public-guess-390.png' });
  if (errors.length) throw Error(errors.join('\n'));
  const report = {
    url,
    at: new Date().toISOString(),
    anonymousHTTPS: 200,
    standalone: true,
    serviceWorker: true,
    offlineReloadAndRound: true,
    correctAction: true,
    browser: 'Chromium macOS',
    errors,
  };
  await fs.writeFile(
    '.openai/artifacts/refinement-public-smoke.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report));
  await context.close();
} finally {
  await browser.close();
}
