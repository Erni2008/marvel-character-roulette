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
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Верный ответ', exact: true }).tap();
  await expect(page.getByText('ВЕРНО!', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('button', { name: 'Следующий раунд' })).toBeInViewport();
  await page.getByRole('button', { name: 'Следующий раунд' }).tap();
  await expect(page.locator('.round-badge')).toContainText('2 / 10');
  await page.screenshot({ path: 'docs/reference/screenshots/iphone-landscape-ru.png' });
});
