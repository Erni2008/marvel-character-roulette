import { test, expect } from '@playwright/test';
import { openApp, select, fixture, sessionKey, prefsKey } from './helpers';
async function ready(page: import('@playwright/test').Page) {
  await openApp(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
}
test('standalone manifest, versioned art/fonts/screen precache and offline gameplay', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__qa/version', { data: 'original' });
  await ready(page);
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toHaveLength(3);
  const urls = await page.evaluate(async () => {
    const keys = await caches.keys(),
      cache = await caches.open(keys.find((k) => k.includes('precache'))!);
    return (await cache.keys()).map((r) => r.url);
  });
  for (const asset of [
    'Guess-',
    'Selection-',
    'city.webp',
    'vault.webp',
    'Exo2-Italic.ttf',
    'characters/manifest.json',
  ])
    expect(urls.some((url) => url.includes(asset))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'PLAY', exact: true })).toBeVisible();
  await select(page, 'ROULETTE');
  await expect(page.locator('.guess-character')).toBeVisible();
  await context.setOffline(false);
});
test('explicit update saves a paused round, and failed installation retains the offline app', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__qa/version', { data: 'original' });
  await ready(page);
  await page.evaluate(
    ({ fixture, sessionKey }) => sessionStorage.setItem(sessionKey, JSON.stringify(fixture)),
    { fixture, sessionKey },
  );
  await page.goto('/#/guess');
  await page.reload();
  await page.getByRole('button', { name: 'Resume timer', exact: true }).click();
  await page.waitForTimeout(1200);
  await request.post('/__qa/version', { data: 'updated' });
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready;
    await r.update();
  });
  await expect(page.getByRole('button', { name: 'UPDATE', exact: true })).toBeVisible();
  await Promise.all([
    page.waitForEvent('framenavigated', { predicate: (frame) => frame === page.mainFrame() }),
    page.getByRole('button', { name: 'UPDATE', exact: true }).click(),
  ]);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: 'Resume timer', exact: true })).toBeVisible();
  expect(
    await page.evaluate((key) => JSON.parse(sessionStorage.getItem(key)!).elapsed, sessionKey),
  ).toBeGreaterThanOrEqual(6000);
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).duration, prefsKey),
  ).toBe(60);
  await request.post('/__qa/version', { data: 'failed' });
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready;
    await r.update();
    await new Promise<void>((resolve) => {
      const w = r.installing;
      if (!w || w.state === 'redundant') {
        resolve();
        return;
      }
      w.addEventListener('statechange', () => {
        if (w.state === 'redundant') resolve();
      });
      setTimeout(resolve, 4000);
    });
  });
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume timer', exact: true })).toBeVisible();
  await context.setOffline(false);
  await request.post('/__qa/version', { data: 'original' });
});
