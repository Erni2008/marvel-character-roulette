import { test, expect } from '@playwright/test';
test('iPhone touch flow, rotation, Russian type and two-finger presentation exit', async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('roulette.intro.v2', '1');
    localStorage.setItem(
      'character-roulette.settings.v2',
      JSON.stringify({ reducedMotion: true, language: 'ru', largerText: true, scale: 1.1 }),
    );
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'НАЧАТЬ ИГРУ', exact: true }).tap();
  await page.getByRole('button', { name: 'ВОЙТИ В КАМЕРУ' }).tap();
  await page.getByRole('button', { name: 'ЗАПУСТИТЬ РУЛЕТКУ' }).tap();
  await expect(page.getByText('ГЕРОЙ ВЫБРАН', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
    false,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'НАЧАТЬ ИСПЫТАНИЕ', exact: true }).tap();
  await page.getByRole('button', { name: 'НАЧАТЬ ИСПЫТАНИЕ', exact: true }).tap();
  await page.getByRole('button', { name: 'ПАУЗА', exact: true }).tap();
  await page.getByRole('button', { name: 'ГОТОВО', exact: true }).tap();
  await expect(page.getByText('УСПЕХ', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Режим трансляции', exact: true }).tap();
  await expect(page.locator('.app-header')).toHaveCount(0);
  await page.locator('main').dispatchEvent('touchstart', {
    touches: [
      { identifier: 0, clientX: 120, clientY: 300 },
      { identifier: 1, clientX: 180, clientY: 300 },
    ],
  });
  await expect(page.locator('.app-header')).toBeVisible();
});
