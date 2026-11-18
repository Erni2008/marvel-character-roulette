import { test, expect } from '@playwright/test';
import { openApp, select, fixture, sessionKey } from './helpers';
import fs from 'node:fs/promises';
for (const [width, height] of [
  [375, 812],
  [390, 844],
  [393, 852],
  [430, 932],
  [768, 1024],
  [820, 1180],
  [1024, 1366],
  [1180, 820],
  [1920, 1080],
  [2560, 1440],
]) {
  test(`reference layouts and complete flow ${width}x${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await openApp(page);
    const directory = `docs/refinement/screenshots/${info.project.name}`;
    await fs.mkdir(directory, { recursive: true });
    const capture = async (name: string) => {
      await page.waitForTimeout(160);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      await page.screenshot({ path: `${directory}/${name}-${width}.png` });
    };
    await capture('home');
    await page.getByRole('button', { name: 'PLAY', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'SELECT MODE', exact: true })).toBeVisible();
    await capture('modes');
    await page.locator('.mode-card-draw').click();
    await expect(page.locator('.guess-screen')).toBeVisible();
    await capture('guess');
    await expect(page.getByRole('timer')).toHaveText('01:00');
    await page.getByRole('button', { name: 'Correct answer', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Correct answer', exact: true })).toBeDisabled();
    await expect(page.getByText('CORRECT!', { exact: true })).toBeVisible();
    await expect(page.locator('.answer-feedback')).toHaveCSS(
      '-webkit-text-fill-color',
      'rgb(245, 247, 255)',
    );
    if (width === 390)
      await page.screenshot({
        path: `docs/refinement/screenshots/${info.project.name}/correct-390.png`,
      });
    expect(
      await page.evaluate(
        () => JSON.parse(sessionStorage.getItem('roulette.session.v3')!).records.length,
      ),
    ).toBe(1);
    await page.getByRole('button', { name: 'Next round', exact: true }).click();
    await expect(page.locator('.guess-screen')).toBeVisible();
    await expect(page.locator('.round-badge')).toContainText('2 / 10');
    await page.getByRole('button', { name: 'Skip character', exact: true }).click();
    await expect(page.locator('.round-badge')).toContainText('3 / 10');
    expect(errors).toEqual([]);
  });
}
test('roulette runs the full sequence and its physical stopping angle matches session state', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  await page.getByRole('button', { name: 'PLAY', exact: true }).click();
  await page.locator('.mode-roulette').click();
  await expect(page.locator('.drawing-wheel')).toBeVisible();
  await page.waitForTimeout(2100);
  await page.screenshot({ path: 'docs/refinement/screenshots/roulette-active-390.png' });

  await expect(page.locator('.selection-ready')).toBeVisible();
  const index = Number(await page.getByTestId('selection-result').getAttribute('data-wheel-index'));
  const transform = await page.locator('.wheel-rotor').getAttribute('transform');
  const angle = Number(transform?.match(/rotate\(([-\d.]+)/)?.[1]);
  const selected = Math.min(119, Math.floor((((-angle % 360) + 360) % 360) / 3));
  expect(selected).toBe(index);
  await expect(page.locator('.guess-screen')).toBeVisible();
  const s = await page.evaluate(() => JSON.parse(sessionStorage.getItem('roulette.session.v3')!));
  expect(s.character.id).toBe(`champion-${String(index + 1).padStart(3, '0')}`);
});
test('normal card animation has an actual timeline, reveal and a skip control', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  await page.getByRole('button', { name: 'PLAY', exact: true }).click();
  await page.locator('.mode-card-draw').click();
  await expect(page.locator('.drawing-card')).toBeVisible();
  await page.waitForTimeout(2100);
  const p = Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
  expect(p).toBeGreaterThan(20);
  expect(p).toBeLessThan(100);
  await page.screenshot({ path: 'docs/refinement/screenshots/card-active-390.png' });
  const selected = await page.evaluate(
    () => JSON.parse(sessionStorage.getItem('roulette.session.v3')!).character.id,
  );
  await page.getByRole('button', { name: 'SKIP ANIMATION' }).click();
  await expect(page.locator('.guess-screen')).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('roulette.session.v3')!).character.id,
    ),
  ).toBe(selected);
});
test('timer pause, settings persistence, language, camera placeholder and stats are functional', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  await select(page);
  await page.waitForTimeout(1250);
  await page.getByRole('button', { name: 'Pause timer', exact: true }).click();
  const paused = await page.getByRole('timer').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByRole('timer')).toHaveText(paused!);
  await page.getByRole('button', { name: 'Game settings' }).click();
  await page.getByLabel('ROUND DURATION').selectOption('30');
  await page.getByLabel('SESSION LENGTH').selectOption('5');
  await page.getByRole('button', { name: 'Camera composition preview' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.locator('video').count()).toBe(0);
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'LANGUAGE', exact: true }).selectOption('ru');
  await expect(page.getByRole('heading', { name: 'НАСТРОЙКИ', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('ДЛИТЕЛЬНОСТЬ РАУНДА')).toHaveValue('30');
  await page.screenshot({
    path: `docs/refinement/screenshots/${test.info().project.name}/settings-ru-390.png`,
    fullPage: true,
  });
  await page.getByRole('combobox', { name: 'ЯЗЫК', exact: true }).selectOption('en');
  await page.goto('/#/stats');
  await expect(page.getByRole('heading', { name: 'YOUR STATS', exact: true })).toBeVisible();
  await page.screenshot({
    path: `docs/refinement/screenshots/${test.info().project.name}/stats-390.png`,
    fullPage: true,
  });
});
test('five-round session, timeout, next and summary use the same state machine', async ({
  page,
}) => {
  await page.addInitScript(
    ({ fixture, sessionKey }) =>
      sessionStorage.setItem(sessionKey, JSON.stringify({ ...fixture, elapsed: 59900 })),
    { fixture, sessionKey },
  );
  await page.goto('/#/guess');
  await page.getByRole('button', { name: 'Resume timer', exact: true }).click();
  await expect(page.getByText('TIME’S UP', { exact: true })).toBeVisible();
  for (let round = 1; round <= 5; round++) {
    if (round > 1) await page.getByRole('button', { name: 'Correct answer', exact: true }).click();
    await page.getByRole('button', { name: 'Next round', exact: true }).click();
    if (round < 5) await expect(page.locator('.round-badge')).toContainText(`${round + 1} / 5`);
  }
  await expect(page.locator('.summary-screen')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: `docs/refinement/screenshots/${test.info().project.name}/summary-390.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('roulette.session.v3')!).records.length,
    ),
  ).toBe(5);
});

test.describe('local PNG presentation', () => {
  test.use({ serviceWorkers: 'block' });
  test('full-body local PNG uses contain and a broken asset recovers to the neutral placeholder', async ({
    page,
  }) => {
    await page.route('**/characters/manifest.json', (route) =>
      route.fulfill({
        json: [
          {
            id: 'local-test',
            name: 'LOCAL TEST',
            imagePath: '/characters/test.png',
            enabled: true,
          },
          {
            id: 'broken-test',
            name: 'BROKEN TEST',
            imagePath: '/characters/missing.png',
            enabled: true,
          },
        ],
      }),
    );
    // A neutral test swatch, not character artwork.
    await page.route('**/characters/test.png', (route) =>
      route.fulfill({
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAYCAYAAADH2bwQAAAAH0lEQVR4nGN89uzZfwY8gAmfJAiMKoCA0XCAgOERDgCwNQPhouLRCQAAAABJRU5ErkJggg==',
          'base64',
        ),
      }),
    );
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await openApp(page);
    await select(page);
    await expect(page.locator('.guess-character img')).toBeVisible();
    expect(
      await page.locator('.guess-character img').evaluate((el) => getComputedStyle(el).objectFit),
    ).toBe('contain');
    await expect(page.locator('.guess-character')).toContainText('LOCAL TEST');
    await page.route('**/characters/missing.png', (route) => route.abort());
    await page.getByRole('button', { name: 'Skip character', exact: true }).click();
    await expect(page.locator('.round-badge')).toContainText('2 / 10');
    await expect(page.locator('.guess-character .neutral-silhouette')).toBeVisible();
  });
});

test('round menu is reachable with presentation controls hidden and pauses accurately', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('character-roulette.settings.v3', JSON.stringify({ stream: true })),
  );
  await openApp(page);
  await select(page);
  await page.waitForTimeout(1150);
  await page.locator('.round-badge').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'KEEP PLAYING', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume timer', exact: true })).toBeVisible();
  const value = await page.getByRole('timer').textContent();
  await page.waitForTimeout(1100);
  await expect(page.getByRole('timer')).toHaveText(value!);
  await page.locator('.round-badge').click();
  await page.getByRole('button', { name: 'MAIN MENU', exact: true }).click();
  await expect(page.locator('.play-button')).toBeVisible();
});
