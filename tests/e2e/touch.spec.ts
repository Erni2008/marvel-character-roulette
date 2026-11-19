import { test, expect } from '@playwright/test';
test('iPhone touch, Russian labels, rotation and presentation controls', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'character-roulette.settings.v3',
      JSON.stringify({ language: 'ru', reducedMotion: true, stream: true }),
    ),
  );
  await page.goto('/');
  await page.locator('.play-button').tap();
  await page.locator('.mode-card-draw').tap();
  await expect(page.locator('.guess-screen')).toBeVisible();
  await expect(page.locator('.guess-settings')).toHaveCount(0);
  const selected = await page.evaluate(
    () => JSON.parse(sessionStorage.getItem('roulette.session.v3')!).character,
  );
  await expect(page.locator('.answer-nameplate strong')).toHaveText(selected.nameRu);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Верный ответ', exact: true }).tap();
  await expect(page.getByText('ВЕРНО!', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('button', { name: 'Следующий раунд' })).toBeInViewport();
  await page.getByRole('button', { name: 'Следующий раунд' }).tap();
  await expect(page.locator('.round-badge')).toContainText('2 / 10');
  await page.screenshot({ path: 'docs/studio/screenshots/iphone-landscape-ru.png' });
  await page.locator('.round-badge').tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'ПРОДОЛЖИТЬ', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Продолжить таймер', exact: true })).toBeVisible();
});
