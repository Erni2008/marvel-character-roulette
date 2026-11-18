import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const sizes = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 1366 },
  { width: 1920, height: 1080 },
];
const session = {
  round: 1,
  player: 1,
  champion: { id: 23, identifier: 'CHAMPION_023' },
  challenge: 'mime',
  restriction: 0,
  history: [
    {
      champion: { id: 23, identifier: 'CHAMPION_023' },
      challenge: 'mime',
      success: true,
      remaining: 22,
      score: 210,
    },
  ],
  elapsed: 0,
};
async function boot(page: Page, screen = 'menu', extra = {}) {
  await page.addInitScript(
    ({ session, extra }) => {
      if (sessionStorage.getItem('qa.seeded')) return;
      sessionStorage.setItem('qa.seeded', '1');
      sessionStorage.setItem('roulette.intro.v2', '1');
      sessionStorage.setItem('roulette.session.v2', JSON.stringify(session));
      localStorage.setItem(
        'character-roulette.settings.v2',
        JSON.stringify({ reducedMotion: true, ...extra }),
      );
    },
    { session, extra },
  );
  await page.goto(`/#/${screen}`);
  await page.locator('main h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
    false,
  );
}
for (const size of sizes)
  test(`responsive composition ${size.width}x${size.height}`, async ({ page }, info) => {
    await page.setViewportSize(size);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await boot(page);
    await page.locator('.webgl-chamber[data-ready=true], .stage-fallback').first().waitFor();
    await page.waitForTimeout(900);
    const notice = page.getByRole('button', { name: 'Dismiss', exact: true });
    if (await notice.count()) await notice.first().click();
    await noOverflow(page);
    const dir = `docs/pwa/screenshots/${info.project.name}`;
    mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/menu-${size.width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'START GAME', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your game. Your rules.' })).toBeVisible();
    await noOverflow(page);
    await page.screenshot({ path: `${dir}/setup-${size.width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'ENTER THE CHAMBER' }).click();
    await expect(page.getByRole('heading', { name: 'Who will you become?' })).toBeVisible();
    await noOverflow(page);
    await page.screenshot({ path: `${dir}/roulette-${size.width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
test('complete round, timer, retry, keyboard navigation, settings persistence', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await boot(page);
  await page.getByRole('button', { name: 'START GAME', exact: true }).click();
  await page.getByRole('button', { name: 'More players' }).click();
  await page.getByRole('combobox', { name: 'ROUND DURATION', exact: true }).selectOption('15');
  await page.getByRole('button', { name: 'ENTER THE CHAMBER' }).click();
  await page.getByRole('button', { name: 'START ROULETTE' }).click();
  await expect(page.getByText('CHAMPION SELECTED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'START CHALLENGE', exact: true }).click();
  await page.getByRole('button', { name: 'START CHALLENGE', exact: true }).click();
  await page.getByRole('button', { name: 'PAUSE', exact: true }).click();
  await expect(page.getByText('PAUSED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'RESUME', exact: true }).click();
  await page.getByRole('button', { name: 'FINISH', exact: true }).click();
  await expect(page.getByText('SUCCESS', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'RETRY', exact: true }).click();
  await page.getByRole('button', { name: 'SKIP ROUND' }).click();
  await expect(page.getByText('NOT THIS TIME', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Main menu', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).first().click();
  await page.getByRole('button', { name: 'RU Русский' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Настройте впечатления.' })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('character-roulette.settings.v2')!).language,
    ),
  ).toBe('ru');
});
test('all challenges, result and settings render on small iPhone and widescreen', async ({
  page,
}, info) => {
  for (const width of [375, 1920]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1080 });
    await boot(page, 'challenge');
    for (const id of ['taboo', 'mime', 'clues', 'word', 'reverse', 'roleplay', 'speed', 'chaos']) {
      await page.evaluate((id) => {
        const s = JSON.parse(sessionStorage.getItem('roulette.session.v2')!);
        s.challenge = id;
        s.elapsed = 0;
        sessionStorage.setItem('roulette.session.v2', JSON.stringify(s));
      }, id);
      await page.reload();
      await page.locator('.challenge-copy h1').waitFor();
      await noOverflow(page);
      await page.screenshot({
        path: `docs/pwa/screenshots/${info.project.name}/challenge-${id}-${width}.png`,
        fullPage: true,
      });
    }
    for (const screen of ['result', 'settings']) {
      await page.goto(`/#/${screen}`);
      await page.reload();
      await page.locator('main h1').waitFor();
      await noOverflow(page);
      await page.screenshot({
        path: `docs/pwa/screenshots/${info.project.name}/${screen}-${width}.png`,
        fullPage: true,
      });
    }
  }
});
test('stream presentation hides host controls and remains operable', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await boot(page, 'roulette', { stream: true, overlays: false });
  await expect(page.locator('.app-header')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'START ROULETTE' })).toHaveCount(0);
  await expect(page.getByText('CHAMPION SELECTED', { exact: true })).toBeVisible();
  await page.locator('main').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.challenge-copy h1')).toBeVisible();
  await expect(page.locator('.challenge-controls')).toHaveCount(0);
  await page.keyboard.press('Space');
  await page.keyboard.press('g');
  await expect(page.getByText('SUCCESS', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.app-header')).toBeVisible();
});

test('full-motion chamber and signature roulette play without resetting selection', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await boot(page, 'menu', { reducedMotion: false });
  await page.locator('.webgl-chamber[data-ready=true]').waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `docs/pwa/screenshots/${info.project.name}/menu-live-1920.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'START GAME', exact: true }).click();
  await page.getByRole('button', { name: 'ENTER THE CHAMBER' }).click();
  await page.getByRole('button', { name: 'START ROULETTE' }).click();
  await expect(page.getByRole('heading', { name: 'Trust the unknown.' })).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({
    path: `docs/pwa/screenshots/${info.project.name}/roulette-in-motion.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Skip sequence' }).click();
  await expect(page.getByText('CHAMPION SELECTED', { exact: true })).toBeVisible();
  const winner = await page.locator('.identifier-window strong').innerText();
  await page.waitForTimeout(1000);
  expect(await page.locator('.identifier-window strong').innerText()).toBe(winner);
});

test('a device without WebGL keeps the full game functional', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind: string, ...args: unknown[]) {
      if (kind === 'webgl' || kind === 'webgl2') return null;
      return original.apply(this, [kind, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await boot(page);
  await expect(page.locator('.stage-fallback')).toBeVisible();
  await page.getByRole('button', { name: 'START GAME', exact: true }).click();
  await page.getByRole('button', { name: 'ENTER THE CHAMBER' }).click();
  await page.getByRole('button', { name: 'START ROULETTE' }).click();
  await expect(page.getByText('CHAMPION SELECTED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'START CHALLENGE', exact: true }).click();
  await expect(page.locator('.challenge-copy h1')).toBeVisible();
});

test('briefings, installation help, settings return and camera aspect ratios work', async ({
  page,
}) => {
  await boot(page);
  await page.getByRole('button', { name: 'How to play', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Install app', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).first().click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'BACK TO EXPERIENCE' }).click();
  await expect(page.getByRole('button', { name: 'START GAME', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).first().click();
  await page.getByRole('button', { name: /Camera composition/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const ratio = () =>
    page.locator('.camera-preview').evaluate((e) => {
      const r = e.getBoundingClientRect();
      return r.width / r.height;
    });
  expect(await ratio()).toBeCloseTo(0.75, 2);
  await page
    .getByRole('combobox', { name: 'COMPOSITION RATIO', exact: true })
    .selectOption('16 / 9');
  await expect.poll(ratio).toBeCloseTo(16 / 9, 2);
  await page.keyboard.press('Escape');
});
