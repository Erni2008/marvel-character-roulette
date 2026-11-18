import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/browser-results.json' }],
  ],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', reducedMotion: 'reduce' },
  projects: [
    { name: 'chromium', testIgnore: '**/touch.spec.ts', use: { browserName: 'chromium' } },
    { name: 'webkit', testIgnore: '**/touch.spec.ts', use: { browserName: 'webkit' } },
    {
      name: 'iphone-webkit',
      testMatch: '**/touch.spec.ts',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'node tests/qa-server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
});
