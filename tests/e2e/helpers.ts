import { expect, type Page } from '@playwright/test';
export const prefsKey = 'character-roulette.settings.v3';
export const sessionKey = 'roulette.session.v3';
export async function openApp(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'PLAY', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}
export async function select(page: Page, method = 'CARD DRAW') {
  await page.getByRole('button', { name: 'PLAY', exact: true }).click();
  await page.locator(method === 'CARD DRAW' ? '.mode-card-draw' : '.mode-roulette').click();
  await expect(page.locator('.guess-screen')).toBeVisible();
}
export const fixture = {
  sessionId: 'qa-session',
  round: 1,
  rounds: 5,
  duration: 60,
  method: 'card',
  character: { id: 'champion-001', name: 'CHAMPION 001', imagePath: '', enabled: true },
  phase: 'guessing',
  outcome: null,
  elapsed: 5000,
  remaining: 55,
  records: [],
};
