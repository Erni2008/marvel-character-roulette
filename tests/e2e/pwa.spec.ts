import { test, expect } from '@playwright/test';
async function openApp(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('roulette.intro.v2', '1');
    if (!localStorage.getItem('character-roulette.settings.v2'))
      localStorage.setItem(
        'character-roulette.settings.v2',
        JSON.stringify({ reducedMotion: true, players: 7 }),
      );
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'START GAME', exact: true })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
}
test('manifest, app-shell precache and offline navigation', async ({ page, context, request }) => {
  await request.post('/__qa/version', { data: 'original' });
  await openApp(page);
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toHaveLength(3);
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys.find((k) => k.includes('precache'))!);
    return (await cache.keys()).map((r) => r.url);
  });
  expect(cached.some((url) => url.includes('Challenge-'))).toBe(true);
  expect(cached.some((url) => url.includes('chamber-engine'))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'START GAME', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'START GAME', exact: true }).click();
  await page.getByRole('button', { name: 'ENTER THE CHAMBER' }).click();
  await page.getByRole('button', { name: 'START ROULETTE' }).click();
  await expect(page.getByText('CHAMPION SELECTED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'START CHALLENGE', exact: true }).click();
  await expect(page.locator('.challenge-copy h1')).toBeVisible();
  await context.setOffline(false);
});
test('explicit update preserves preferences and a failed install retains the old offline app', async ({
  page,
  context,
  request,
}) => {
  await request.post('/__qa/version', { data: 'original' });
  await openApp(page);
  await page.evaluate(() =>
    sessionStorage.setItem(
      'roulette.session.v2',
      JSON.stringify({
        round: 1,
        player: 1,
        champion: { id: 23, identifier: 'CHAMPION_023' },
        challenge: 'mime',
        restriction: 0,
        history: [],
        elapsed: 5000,
      }),
    ),
  );
  await page.goto('/#/challenge');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME', exact: true }).click();
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
  await expect(page.getByRole('button', { name: 'RESUME', exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('character-roulette.settings.v2')!).players,
    ),
  ).toBe(7);
  expect(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem('roulette.session.v2')!).elapsed),
  ).toBeGreaterThanOrEqual(6000);
  await request.post('/__qa/version', { data: 'failed' });
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready;
    await r.update();
    await new Promise<void>((resolve) => {
      const worker = r.installing;
      if (!worker || worker.state === 'redundant') {
        resolve();
        return;
      }
      worker.addEventListener('statechange', () => {
        if (worker.state === 'redundant') resolve();
      });
      setTimeout(resolve, 4000);
    });
  });
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'RESUME', exact: true })).toBeVisible();
  await context.setOffline(false);
  await request.post('/__qa/version', { data: 'original' });
});
