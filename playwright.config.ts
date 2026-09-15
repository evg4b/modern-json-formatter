import { defineConfig } from '@playwright/test';

const isCi = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',

  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: isCi ? 2 : undefined,
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark',
    trace: 'on-first-retry',
  },
});
