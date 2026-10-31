import { expect, Page } from '@playwright/test';
import { ADMIN, API, loginUi, retry429, test, watchForErrors } from './helpers';

const CORS = { 'Access-Control-Allow-Origin': '*' };

// Google can't be automated, so only its round trip is faked: the button's redirect lands straight on the
// front callback, and the API callback answers with a real session. Everything after that is the real app.
async function fakeGoogle(page: Page, { firstTime = false, status = 200, regularUser = false } = {}) {
  const login = await (await retry429(() => page.request.post(`${API}/login`, { data: ADMIN }))).json();
  // the session stays valid; only the front sees a non-admin user
  if (regularUser) login.user.role = null;

  await page.route(`${API}/login-google`, (route) =>
    route.fulfill({ status: 302, headers: { Location: new URL('/login-google/callback?code=abc', page.url()).href } }));

  await page.route(`${API}/login-google/callback*`, (route) =>
    route.fulfill({
      status,
      headers: CORS,
      contentType: 'application/json',
      body: JSON.stringify(status === 200
        ? { code: 200, status: 'success', first_time: firstTime, token: login.token, user: login.user }
        : { code: status, status: 'error', message: 'Email not verified' }),
    }));

  return login.user;
}

async function loginWithGoogle(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /google/i }).click();
}

const header = (page: Page) => page.locator('app-header');

test('el botón de Google apunta a la API, que redirige a Google', async ({ page, request }) => {
  const response = await retry429(() => request.get(`${API}/login-google`, { maxRedirects: 0 }));
  expect(response.status()).toBe(302);
  expect(response.headers()['location']).toContain('accounts.google.com');
});

test('al volver de Google la cabecera muestra al usuario, también tras recargar', async ({ page }) => {
  const user = await fakeGoogle(page);
  const errors = watchForErrors(page);

  await loginWithGoogle(page);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(header(page).getByText('Iniciar sesión')).toHaveCount(0);
  await expect(header(page).getByText(`@${user.username}`)).toHaveCount(1);
  await expect(header(page).getByText(user.fullName)).toHaveCount(1);

  await page.reload();
  await expect(header(page).getByText(`@${user.username}`)).toHaveCount(1);
  await page.goto('/list');
  await expect(page.getByRole('heading', { name: 'Mis listas' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('la primera vez lleva al perfil y al guardar la cabecera cambia sin recargar', async ({ page }) => {
  await fakeGoogle(page, { firstTime: true });
  // the save is faked so the admin account isn't renamed
  await page.route(`${API}/user/current`, (route) => route.request().method() === 'PUT'
    ? route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: '{"code":200,"status":"success"}' })
    : route.fallback());

  await loginWithGoogle(page);
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.locator('[formcontrolname=username]')).not.toHaveValue('');

  await page.locator('[formcontrolname=username]').fill('nombreelegido');
  await page.locator('[formcontrolname=name]').fill('Nombre');
  await page.locator('[formcontrolname=surname]').fill('Elegido');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(header(page).getByText('@nombreelegido')).toHaveCount(1);
  await expect(header(page).getByText('Nombre Elegido')).toHaveCount(1);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('currentUser')!));
  expect(stored.username).toBe('nombreelegido');
  expect(stored.token).toBeTruthy();
});

test('vuelve a la página protegida pedida y no la reutiliza en el siguiente login', async ({ page }) => {
  await fakeGoogle(page);
  await page.goto('/contact/list');
  await expect(page).toHaveURL(/\/login/);

  await page.getByRole('button', { name: /google/i }).click();

  await expect(page).toHaveURL(/\/contact\/list/);
  expect(await page.evaluate(() => sessionStorage.getItem('returnUrl'))).toBeNull();
});

test('si Google falla vuelve a login sin sesión', async ({ page }) => {
  await fakeGoogle(page, { status: 400 });

  await loginWithGoogle(page);

  await expect(page).toHaveURL(/\/login/);
  expect(await page.evaluate(() => localStorage.getItem('currentUser'))).toBeNull();
});

test('cerrar sesión deja la cabecera como anónimo sin recargar', async ({ page }) => {
  const user = await fakeGoogle(page, { regularUser: true });
  await loginWithGoogle(page);
  await expect(header(page).getByText(`@${user.username}`)).toHaveCount(1);
  await page.evaluate(() => { (window as any).sameDocument = true; });

  await header(page).getByRole('button', { name: /cerrar sesi/i }).evaluate((button: HTMLElement) => button.click());
  await expect(page).toHaveURL(/\/login/);
  expect(await page.evaluate(() => localStorage.getItem('currentUser'))).toBeNull();

  // going back is a client-side navigation: a stale AuthenticationService survives it
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(header(page).getByText('Iniciar sesión').first()).toBeVisible({ timeout: 10_000 });
  await expect(header(page).getByText(`@${user.username}`)).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).sameDocument)).toBe(true);
});

test('tras cerrar sesión se puede entrar con contraseña y la cabecera se actualiza', async ({ page }) => {
  await fakeGoogle(page);
  await loginWithGoogle(page);
  await expect(page).toHaveURL(/\/dashboard/);
  await header(page).getByRole('button', { name: /cerrar sesi/i }).evaluate((button: HTMLElement) => button.click());
  await expect(page).toHaveURL(/\/login/);

  await page.locator('[formcontrolname=email]').fill(ADMIN.email);
  await page.locator('[formcontrolname=password]').fill(ADMIN.password);
  await page.locator('button[type=submit]').click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(header(page).getByText('Iniciar sesión')).toHaveCount(0);
});

test('entrar con Google estando ya en otra pestaña con sesión de contraseña no rompe nada', async ({ page }) => {
  await loginUi(page);
  await fakeGoogle(page);

  await page.goto('/login-google/callback?code=abc');

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(header(page).getByText('Iniciar sesión')).toHaveCount(0);
});
