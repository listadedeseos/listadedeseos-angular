import { APIRequestContext, APIResponse, test as base, expect, Page } from '@playwright/test';

export const API = process.env['E2E_API_URL'] ?? 'http://localhost:8000/api';
export const ADMIN = {
  email: process.env['E2E_EMAIL'] ?? 'admin@admin.com',
  password: process.env['E2E_PASSWORD'] ?? 'admin',
};

// Wish list names must be alpha_num for the API
export const uniqueName = (prefix: string) => `${prefix}${Date.now()}`;

// The API allows 60 requests/minute per IP, which this suite exceeds: wait out each 429
// so a test only ever sees the real response
const retryAfterMs = (seconds?: string) => (Number(seconds) || 5) * 1000 + 250;

export async function retry429(send: () => Promise<APIResponse>) {
  let response = await send();
  while (response.status() === 429) {
    await new Promise((resolve) => setTimeout(resolve, retryAfterMs(response.headers()['retry-after'])));
    response = await send();
  }
  return response;
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(`${API}/**`, async (route) => {
      const response = await retry429(() => route.fetch());
      await route.fulfill({ response });
    });
    await use(page);
    // requests still in flight when the test ends must not fail it
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  },
});

export async function loginUi(page: Page) {
  await page.goto('/login');
  await page.locator('[formcontrolname=email]').fill(ADMIN.email);
  await page.locator('[formcontrolname=password]').fill(ADMIN.password);
  await page.locator('button[type=submit]').click();
  await expect(page).not.toHaveURL(/\/login/);
}

export async function apiToken(request: APIRequestContext) {
  const response = await retry429(() => request.post(`${API}/login`, { data: ADMIN }));
  expect(response.status()).toBe(200);
  return (await response.json()).token as string;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function createWishList(request: APIRequestContext, token: string, name: string) {
  const response = await retry429(() => request.post(`${API}/wishlist`, { headers: bearer(token), data: { name } }));
  expect(response.ok()).toBeTruthy();
  return (await response.json()).wishList as { id: number; uuid: string; name: string };
}

export async function deleteWishList(request: APIRequestContext, token: string, id: number) {
  await retry429(() => request.delete(`${API}/wishlist/${id}`, { headers: bearer(token) }));
}

// Fails the test on uncaught exceptions, console errors and 5xx API responses
export function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    // third-party requests (Google Analytics) depend on the network, not on the app
    const isThirdParty = !/^https?:\/\/localhost/.test(message.location().url) && message.text().startsWith('Failed to load resource');
    // known: @some-angular-utils/modal flips its closing class during change detection (dev mode only)
    const isModalLibraryNoise = message.text().includes('NG0100') && message.text().includes('sau-modal-closing');
    if (!isThirdParty && !isModalLibraryNoise) errors.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 500) errors.push(`${response.status()} ${response.url()}`);
  });
  return errors;
}
