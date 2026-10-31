import { defineConfig } from '@playwright/test';

// E2E against the already running local stack: front on :4200, Laravel API on :8000.
// Tests clean up the rows they create, but they do write to the local database.
export default defineConfig({
  testDir: './e2e',
  // tests share one admin account and its list of wish lists
  workers: 1,
  fullyParallel: false,
  // long enough to wait out the API rate limit (see retry429)
  timeout: 240_000,
  expect: { timeout: 75_000 },
  reporter: 'list',
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
    channel: 'chrome',
    actionTimeout: 75_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
