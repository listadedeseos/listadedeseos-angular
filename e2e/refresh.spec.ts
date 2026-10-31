import { expect as baseExpect, Page } from '@playwright/test';
import { API, test } from './helpers';
import { ISOLATED_API, startBackend, stopBackend, useBackend } from './isolated-backend';

// The app is zoneless: anything an async handler changes only shows if it asks for change detection.
// Every test here checks the screen after each action, inside one document: no reload hides a stale view.
const expect = baseExpect.configure({ timeout: 8_000 });

const ADMIN = { email: 'admin@admin.com', password: 'admin' };
const USER = { email: 'usuario@usuario.com', password: 'usuario' };

const modal = (page: Page) => page.locator('sau-modal');
const accept = (page: Page) => modal(page).getByRole('button', { name: 'Aceptar' }).click();
const card = (page: Page, name: string) => page.locator('app-card').filter({ hasText: name });
const productCount = (page: Page) => page.getByRole('heading', { name: 'Productos' }).locator('xpath=following-sibling::span[1]');
const header = (page: Page) => page.locator('app-header');

async function login(page: Page, { email, password } = ADMIN) {
  await page.goto('/login');
  await page.locator('[formcontrolname=email]').fill(email);
  await page.locator('[formcontrolname=password]').fill(password);
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/dashboard/);
}

// Navigates inside the app, so the marker set by watchDocument survives
async function goTo(page: Page, path: string) {
  await page.evaluate((target) => { history.pushState({}, '', target); dispatchEvent(new PopStateEvent('popstate')); }, path);
  await expect(page).toHaveURL(new RegExp(path));
}

async function watchDocument(page: Page) {
  await page.evaluate(() => { (window as any).sameDocument = true; });
}

async function expectNoReload(page: Page) {
  expect(await page.evaluate(() => (window as any).sameDocument), 'la página se ha recargado').toBe(true);
}

// The busy overlay covers the modal: if it stays, the modal looks alive but ignores every click
const modalBusy = (page: Page) => modal(page).locator('.animate-spin');

async function api(token: string | null, method: string, path: string, data?: object) {
  const response = await fetch(`${ISOLATED_API}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

const apiLogin = async (credentials = ADMIN) => (await api(null, 'POST', 'login', credentials)).token as string;

test.beforeAll(startBackend);
test.afterAll(stopBackend);
test.beforeEach(({ page }) => useBackend(page));

test.describe('lista de deseos', () => {
  test('añadir, editar, reservar y borrar productos actualiza tarjetas y contador', async ({ page }) => {
    await login(page);
    await watchDocument(page);
    await goTo(page, '/list');
    await expect(page.getByRole('heading', { name: 'Mis listas' })).toBeVisible();
    await expect(productCount(page)).not.toHaveText('0');
    const before = Number(await productCount(page).innerText());

    await page.getByRole('button', { name: 'Añadir producto' }).first().click();
    await modal(page).locator('[formcontrolname=name]').fill('Lámpara');
    await modal(page).getByRole('button', { name: 'Mostrar campos opcionales' }).click();
    await modal(page).locator('[formcontrolname=price]').fill('30');
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    await expect(card(page, 'Lámpara')).toContainText('30,00');
    await expect(productCount(page)).toHaveText(String(before + 1));

    await card(page, 'Lámpara').getByTitle('Editar producto').click();
    await expect(modal(page).locator('[formcontrolname=name]')).toHaveValue('Lámpara');
    await expect(modalBusy(page)).toHaveCount(0);
    await modal(page).locator('[formcontrolname=name]').fill('Lámpara de pie');
    await modal(page).locator('[formcontrolname=price]').fill('45');
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    await expect(card(page, 'Lámpara de pie')).toContainText('45,00');

    await page.getByRole('button', { name: /Mostrar reservas/ }).click();
    await card(page, 'Lámpara de pie').getByTitle('Reservar producto').click();
    await expect(card(page, 'Lámpara de pie').getByTitle('Eliminar reserva')).toBeVisible();
    await card(page, 'Lámpara de pie').getByTitle('Eliminar reserva').click();
    await expect(card(page, 'Lámpara de pie').getByTitle('Reservar producto')).toBeVisible();

    await card(page, 'Lámpara de pie').getByTitle('Eliminar producto').click();
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    await expect(card(page, 'Lámpara de pie')).toHaveCount(0);
    await expect(productCount(page)).toHaveText(String(before));
    await expectNoReload(page);
  });

  test('crear, ajustar y borrar una lista actualiza tarjetas, cabecera y enlace', async ({ page }) => {
    await login(page);
    await watchDocument(page);
    await goTo(page, '/list');
    await expect(page.getByRole('heading', { name: 'Mis listas' })).toBeVisible();

    await page.getByRole('button', { name: 'Nueva lista' }).click();
    await modal(page).locator('[formcontrolname=name]').fill('Vacaciones');
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    const tile = page.getByRole('link', { name: 'Vacaciones' });
    await expect(tile).toBeVisible();

    await tile.click();
    await expect(page).toHaveURL(/\/list\/[0-9a-f-]{36}/);

    // settings modal: loads the values and stays usable
    await page.getByRole('button', { name: 'Configurar lista' }).first().click();
    await expect(modal(page).locator('[formcontrolname=name]')).toHaveValue('Vacaciones');
    await expect(modalBusy(page)).toHaveCount(0);
    await modal(page).locator('[formcontrolname=name]').fill('Verano');
    await modal(page).getByText('Navidad').click();
    await modal(page).locator('[formcontrolname=date_end]').fill('2030-05-20');
    await accept(page);
    await expect(modal(page)).toHaveCount(0);

    await expect(page.getByRole('link', { name: /Verano/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vacaciones' })).toHaveCount(0);
    await expect(page.locator('main, section').getByText('20/05/2030').first()).toBeVisible();
    await expect(page.getByText('Navidad').first()).toBeVisible();

    const tileBox = page.locator('div').filter({ has: page.getByRole('link', { name: /Verano/ }) }).last();
    await tileBox.getByTitle('Eliminar lista').click();
    await expect(page.getByRole('link', { name: /Verano/ })).toHaveCount(0);
    await expect(page).toHaveURL(/\/list\//);
    await expectNoReload(page);
  });

  test('un nombre de lista no válido avisa y el modal sigue funcionando', async ({ page }) => {
    await login(page);
    await page.goto('/list');
    await page.getByRole('button', { name: 'Nueva lista' }).click();

    // the API only accepts alphanumeric names
    await modal(page).locator('[formcontrolname=name]').fill('Mi lista con espacios');
    await accept(page);

    await expect(page.locator('body')).toContainText(/no se ha podido|error|no válido/i);
    await expect(modalBusy(page)).toHaveCount(0);

    await modal(page).locator('[formcontrolname=name]').fill('Corregida');
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Corregida' })).toBeVisible();
  });

  test('si falla guardar o borrar un producto avisa y nada queda bloqueado', async ({ page }) => {
    await login(page);
    await page.goto('/list');
    await expect(productCount(page)).not.toHaveText('0');
    const count = await productCount(page).innerText();

    const failOn = (method: string) => page.route(`${API}/product**`, (route) => route.request().method() === method
      ? route.fulfill({ status: 500, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: '{"message":"fallo"}' })
      : route.fallback());

    await failOn('POST');
    await page.getByRole('button', { name: 'Añadir producto' }).first().click();
    await modal(page).locator('[formcontrolname=name]').fill('Fallido');
    await accept(page);
    await expect(page.locator('body')).toContainText('No se ha podido guardar el producto');
    await expect(modalBusy(page)).toHaveCount(0);
    await modal(page).getByRole('button', { name: 'Cancelar' }).click();
    await expect(modal(page)).toHaveCount(0);
    await expect(productCount(page)).toHaveText(count);

    await failOn('DELETE');
    await page.locator('app-card').first().getByTitle('Eliminar producto').click();
    await accept(page);
    await expect(page.locator('body')).toContainText('No se ha podido borrar');
    await modal(page).getByRole('button', { name: 'Cancelar' }).click();
    await expect(modal(page)).toHaveCount(0);
    await expect(productCount(page)).toHaveText(count);
  });

  test('borrar la lista que se está viendo vuelve a la principal', async ({ page }) => {
    const token = await apiLogin();
    const list = (await api(token, 'POST', 'wishlist', { name: 'Temporal' })).wishList;
    await login(page);
    await watchDocument(page);
    await goTo(page, `/list/${list.uuid}`);
    await expect(page.getByRole('link', { name: 'Temporal' })).toBeVisible();

    await page.locator('div').filter({ has: page.getByRole('link', { name: 'Temporal' }) }).last().getByTitle('Eliminar lista').click();

    await expect(page.getByRole('link', { name: 'Temporal' })).toHaveCount(0);
    await expect(page).not.toHaveURL(new RegExp(list.uuid));
    await expect(productCount(page)).not.toHaveText('0');
    await expectNoReload(page);
  });
});

test.describe('perfil', () => {
  test('carga los datos, avisa de errores y al guardar actualiza la cabecera', async ({ page }) => {
    await login(page, USER);
    await watchDocument(page);
    await goTo(page, '/profile');
    await expect(page.locator('[formcontrolname=name]')).toHaveValue('Usuario');
    await expect(page.locator('[formcontrolname=email]')).toHaveValue(USER.email);
    await expect(page.getByText('Cargando...')).toHaveCount(0);

    // username taken: the form must say so and stay usable
    await page.locator('[formcontrolname=username]').fill('admin');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.locator('.text-danger-text').first()).toBeVisible();
    await expect(page.getByText('Cargando...')).toHaveCount(0);

    await page.locator('[formcontrolname=username]').fill('usuario2');
    await page.locator('[formcontrolname=name]').fill('Nuevo');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(header(page).getByText('@usuario2')).toHaveCount(1);
    await expect(header(page).getByText('Nuevo Prueba')).toHaveCount(1);
    await expectNoReload(page);

    // restored for the other tests
    await api(await apiLogin(USER), 'PUT', 'user/current', { username: 'usuario', name: 'Usuario', surname: 'Prueba', email: USER.email });
  });

  test('cambiar la lista principal se ve en Mis listas', async ({ page }) => {
    const token = await apiLogin(USER);
    const list = (await api(token, 'POST', 'wishlist', { name: 'Favorita' })).wishList;
    await login(page, USER);
    await watchDocument(page);
    await goTo(page, '/profile');
    await expect(page.locator('[formcontrolname=name]')).toHaveValue('Usuario');

    await page.locator('select').selectOption(String(list.id));
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await goTo(page, '/list');
    const tile = page.locator('div').filter({ has: page.getByRole('link', { name: 'Favorita' }) }).last();
    await expect(tile.getByTitle('Lista principal')).toBeVisible();
    await expect(tile.getByTitle('Eliminar lista')).toHaveCount(0);
    await expectNoReload(page);
  });
});

test.describe('administración', () => {
  test('editar y borrar usuarios actualiza la tabla', async ({ page }) => {
    await api(null, 'POST', 'user', { username: 'temporal', name: 'Temporal', surname: 'Borrable', email: 'temporal@example.com', password: 'clave12345' });
    await login(page);
    await watchDocument(page);
    await goTo(page, '/user');

    const row = page.locator('tr.sau-table-desktop-row').filter({ hasText: '@temporal' });
    await expect(row).toBeVisible();

    await row.getByRole('button').first().click();
    await expect(modal(page).locator('[formcontrolname=name]')).toHaveValue('Temporal');
    await expect(modalBusy(page)).toHaveCount(0);

    // duplicate email: must warn and stay usable
    await modal(page).locator('[formcontrolname=email]').fill(ADMIN.email);
    await accept(page);
    await expect(page.locator('body')).toContainText(/no se ha podido/i);
    await expect(modalBusy(page)).toHaveCount(0);

    await modal(page).locator('[formcontrolname=email]').fill('temporal@example.com');
    await modal(page).locator('[formcontrolname=name]').fill('Renombrado');
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    await expect(row).toContainText('Renombrado');

    await row.getByRole('button').last().click();
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    await expect(row).toHaveCount(0);
    await expectNoReload(page);
  });

  test('cambiar el estado de un mensaje actualiza filas, pestañas y cabecera', async ({ page }) => {
    await api(null, 'POST', 'contact', { type: 'suggestion', name: 'Pepe Prueba', email: 'pepe@example.com', title: 'Idea refresco', body: 'Una idea' });
    await login(page);
    await watchDocument(page);

    await goTo(page, '/contact/list');
    const row = page.locator('tr.sau-table-desktop-row').filter({ hasText: 'Idea refresco' });
    await expect(row).toBeVisible();

    const tab = (name: string) => page.getByRole('tab', { name: new RegExp(name) });
    const count = async (name: string) => Number(await tab(name).locator('span').innerText());
    await expect(tab('Pendiente')).not.toContainText(/^\D*0\s*$/);
    const pending = await count('Pendiente');
    const inProgress = await count('En curso');

    await row.locator('select').selectOption('in_progress');
    await expect(row).toHaveCount(0);
    await expect(tab('Pendiente').locator('span')).toHaveText(String(pending - 1));
    await expect(tab('En curso').locator('span')).toHaveText(String(inProgress + 1));

    await tab('En curso').click();
    await expect(row).toBeVisible();

    // header dropdown, reloaded when it opens
    await header(page).locator('.group\\/general-dropdown').hover();
    await expect(header(page).getByText(`${pending - 1} pendientes`)).toHaveCount(1);

    // close the dropdown, which covers the table while hovered
    await page.mouse.move(0, 800);
    await row.getByRole('button').last().click();
    await accept(page);
    await expect(modal(page)).toHaveCount(0);
    await expect(row).toHaveCount(0);
    await expect(tab('En curso').locator('span')).toHaveText(String(inProgress));
    await expectNoReload(page);
  });

  test('las estadísticas cambian al alternar pestaña, buscar y ordenar', async ({ page }) => {
    await login(page);
    await watchDocument(page);
    await goTo(page, '/stats/products');

    const table = page.locator('sau-table');
    await expect(table).toContainText('Taza de cerámica');

    await page.locator('input[type=search]').fill('Taza');
    await expect(table).toContainText('Taza de cerámica');
    await expect(table).not.toContainText('Libro de recetas');

    await page.locator('input[type=search]').fill('');
    await expect(table).toContainText('Libro de recetas');

    await page.locator('nav, div').getByRole('link', { name: /Steam/ }).first().click();
    await expect(page).toHaveURL(/\/stats\/steam/);
    await expect(table).not.toContainText('Taza de cerámica');
    await expectNoReload(page);
  });
});

test.describe('sugerencias', () => {
  test('enviar deja el formulario limpio y listo para otro mensaje', async ({ page }) => {
    await page.goto('/contact?type=suggestion');
    const button = page.locator('button[type=submit]');
    const title = page.locator('[formcontrolname=title]');

    await page.locator('[formcontrolname=name]').fill('Visitante');
    await page.locator('[formcontrolname=email]').fill('visitante@example.com');
    await title.fill('Primer mensaje');
    await page.locator('[formcontrolname=body]').fill('Texto');
    await button.click();

    await expect(page.locator('body')).toContainText('Mensaje enviado');
    await expect(title).toHaveValue('');
    await expect(button).toBeEnabled();
    await expect(page.getByText('Cargando...')).toHaveCount(0);
    await expect(page.locator('[formcontrolname=type]')).toHaveValue('suggestion');
  });

  test('con sesión no pide nombre ni correo, y al cerrarla vuelve a pedirlos', async ({ page }) => {
    await login(page, USER);
    await watchDocument(page);
    await goTo(page, '/contact');
    await expect(page.locator('[formcontrolname=title]')).toBeVisible();
    await expect(page.locator('[formcontrolname=name]')).toHaveCount(0);

    await header(page).getByRole('button', { name: /cerrar sesi/i }).evaluate((button: HTMLElement) => button.click());
    await expect(page).toHaveURL(/\/login/);

    await goTo(page, '/contact');
    await expect(page.locator('[formcontrolname=name]')).toBeVisible();
    await expect(header(page).getByText('Iniciar sesión').first()).toBeVisible();
    await expectNoReload(page);
  });
});
