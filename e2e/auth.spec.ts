import { expect } from '@playwright/test';
import { ADMIN, loginUi, test } from './helpers';

test('una contraseña incorrecta muestra error y no inicia sesión', async ({ page }) => {
  await page.goto('/login');
  await page.locator('[formcontrolname=email]').fill(ADMIN.email);
  await page.locator('[formcontrolname=password]').fill('incorrecta');
  await page.locator('button[type=submit]').click();

  await expect(page.getByText('Error con el correo electrónico o contraseña')).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/login/);
  expect(await page.evaluate(() => localStorage.getItem('currentUser'))).toBeNull();
});

test('registrarse con un correo ya usado muestra el error', async ({ page }) => {
  await page.goto('/register');
  await page.locator('[formcontrolname=name]').fill('Prueba');
  await page.locator('[formcontrolname=surname]').fill('Prueba');
  await page.locator('[formcontrolname=username]').fill('admin');
  await page.locator('[formcontrolname=email]').fill(ADMIN.email);
  await page.locator('[formcontrolname=password]').fill('clave12345');
  await page.locator('[formcontrolname=repassword]').fill('clave12345');

  const rejected = page.waitForResponse((r) => r.url().endsWith('/api/user') && r.request().method() === 'POST');
  await page.locator('button[type=submit]').click();
  expect((await rejected).ok()).toBeFalsy();

  await expect(page.getByText('Un error ha ocurrido al intentar registrarte')).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/register/);
});

for (const path of ['/list', '/user', '/profile', '/contact/list', '/stats/steam']) {
  test(`${path} redirige a login sin sesión`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  });
}

test('el administrador inicia sesión y la sesión sobrevive a una recarga', async ({ page }) => {
  await loginUi(page);
  expect(await page.evaluate(() => localStorage.getItem('currentUser'))).not.toBeNull();

  await page.goto('/list');
  await page.reload();
  await expect(page).toHaveURL(/\/list/);
  await expect(page.getByRole('heading', { name: 'Mis listas' })).toBeVisible();
});
