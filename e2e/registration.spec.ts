import { expect, Page } from '@playwright/test';
import { test } from './helpers';
import { securityCode, startBackend, stopBackend, useBackend } from './isolated-backend';

const header = (page: Page) => page.locator('app-header');

// Arrives through the login page's link, so AuthenticationService already exists without a session
async function register(page: Page, username: string) {
  await page.goto('/login');
  await page.locator('a[href="/register"]').first().click();
  await page.locator('[formcontrolname=name]').fill('Ana');
  await page.locator('[formcontrolname=surname]').fill('Prueba');
  await page.locator('[formcontrolname=username]').fill(username);
  await page.locator('[formcontrolname=email]').fill(`${username}@example.com`);
  await page.locator('[formcontrolname=password]').fill('clave12345');
  await page.locator('[formcontrolname=repassword]').fill('clave12345');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/verify\/\d+/);
  return `${username}@example.com`;
}

async function enterCode(page: Page, code: string) {
  await page.locator('[formcontrolname=security_code]').fill(code);
  await page.locator('button[type=submit]').click();
}

async function expectLoggedIn(page: Page, username: string) {
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(header(page).getByText('Iniciar sesión')).toHaveCount(0);
  await expect(header(page).getByText(`@${username}`)).toHaveCount(1);
  await expect(header(page).getByText('Ana Prueba')).toHaveCount(1);
}

// A real session: the guarded page loads the user's own default list from the API
async function expectWorkingSession(page: Page) {
  await page.goto('/list');
  await expect(page).toHaveURL(/\/list/);
  await expect(page.getByRole('link', { name: 'Principal' })).toBeVisible();
}

async function logout(page: Page) {
  await header(page).getByRole('button', { name: /cerrar sesi/i }).evaluate((button: HTMLElement) => button.click());
  await expect(page).toHaveURL(/\/login/);
}

test.beforeAll(startBackend);
test.afterAll(stopBackend);
test.beforeEach(({ page }) => useBackend(page));

test('registrarse, verificar el código e iniciar sesión sin recargar', async ({ page }) => {
  const email = await register(page, 'anacompleta');

  await page.evaluate(() => { (window as any).sameDocument = true; });
  await enterCode(page, securityCode(email));

  await expectLoggedIn(page, 'anacompleta');
  expect(await page.evaluate(() => (window as any).sameDocument)).toBe(true);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('currentUser')!));
  expect(stored.token).toBeTruthy();
  expect(stored.security_code).toBeUndefined();

  await page.reload();
  await expectLoggedIn(page, 'anacompleta');
  await expectWorkingSession(page);
});

test('tras registrarse se puede cerrar sesión y volver a entrar con contraseña', async ({ page }) => {
  const email = await register(page, 'anavuelve');
  await enterCode(page, securityCode(email));
  await expectLoggedIn(page, 'anavuelve');

  await logout(page);
  await page.goBack();
  await expect(header(page).getByText('Iniciar sesión').first()).toBeVisible();
  await page.goto('/login');

  await page.locator('[formcontrolname=email]').fill(email);
  await page.locator('[formcontrolname=password]').fill('clave12345');
  await page.locator('button[type=submit]').click();

  await expectLoggedIn(page, 'anavuelve');
  await expectWorkingSession(page);
});

test('un código incorrecto avisa y permite reintentar', async ({ page }) => {
  const email = await register(page, 'anacodigo');
  const code = securityCode(email);

  await enterCode(page, code === '0000' ? '1111' : '0000');
  await expect(page.getByText('Código incorrecto')).toBeVisible();
  await expect(page).toHaveURL(/\/verify\/\d+/);
  expect(await page.evaluate(() => localStorage.getItem('currentUser'))).toBeNull();

  await enterCode(page, code);
  await expectLoggedIn(page, 'anacodigo');
});

test('quien no verificó y entra con su contraseña va a poner el código', async ({ page }) => {
  const email = await register(page, 'anapendiente');
  await page.goto('/login');

  await page.locator('[formcontrolname=email]').fill(email);
  await page.locator('[formcontrolname=password]').fill('clave12345');
  await page.locator('button[type=submit]').click();

  await expect(page).toHaveURL(/\/verify\/\d+/);
  expect(await page.evaluate(() => localStorage.getItem('currentUser'))).toBeNull();

  await enterCode(page, securityCode(email));
  await expectLoggedIn(page, 'anapendiente');
  await expectWorkingSession(page);
});
