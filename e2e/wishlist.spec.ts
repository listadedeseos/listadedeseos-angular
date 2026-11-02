import { expect } from '@playwright/test';
import { API, apiToken, bearer, createWishList, deleteWishList, loginUi, retry429, test, uniqueName, watchForErrors } from './helpers';

test('crear lista, añadir, editar y borrar un producto, y borrar la lista', async ({ page, request }) => {
  const token = await apiToken(request);
  const listName = uniqueName('e2e');
  const created: number[] = [];

  try {
    await loginUi(page);
    const errors = watchForErrors(page);
    await page.goto('/list');

    // Nueva lista
    await page.getByRole('button', { name: 'Nueva lista' }).click();
    const listModal = page.locator('sau-modal');
    await listModal.locator('[formcontrolname=name]').fill(listName);
    const listSaved = page.waitForResponse((r) => r.url().endsWith('/api/wishlist') && r.request().method() === 'POST');
    await listModal.getByRole('button', { name: 'Aceptar' }).click();
    const wishList = (await (await listSaved).json()).wishList;
    created.push(wishList.id);
    await expect(listModal).toHaveCount(0);

    const tile = page.getByRole('link', { name: listName });
    await tile.click();
    await expect(page).toHaveURL(new RegExp(`/list/${wishList.uuid}`));

    // Añadir producto
    await page.getByRole('button', { name: 'Añadir producto' }).first().click();
    const productModal = page.locator('sau-modal');
    await productModal.locator('[formcontrolname=name]').fill('Producto E2E');
    await productModal.getByRole('button', { name: 'Mostrar campos opcionales' }).click();
    await productModal.locator('[formcontrolname=price]').fill('9.5');
    await productModal.getByRole('button', { name: 'Aceptar' }).click();
    await expect(productModal).toHaveCount(0);
    await expect(page.locator('app-card').filter({ hasText: 'Producto E2E' })).toContainText('9,50');

    // Editar producto: el formulario llega con los datos y el cambio se ve sin recargar
    await page.getByTitle('Editar producto').click();
    const editModal = page.locator('sau-modal');
    await expect(editModal.locator('[formcontrolname=name]')).toHaveValue('Producto E2E');
    await editModal.locator('[formcontrolname=name]').fill('Producto editado');
    await editModal.getByRole('button', { name: 'Aceptar' }).click();
    await expect(editModal).toHaveCount(0);
    await expect(page.locator('app-card')).toContainText('Producto editado');

    // El cambio llegó a la base de datos
    await page.reload();
    await expect(page.locator('app-card')).toContainText('Producto editado');

    // Borrar producto
    await page.getByTitle('Eliminar producto').click();
    await page.locator('sau-modal').getByRole('button', { name: 'Aceptar' }).click();
    await expect(page.locator('app-card')).toHaveCount(0);

    // Borrar lista
    await page.locator('div').filter({ has: page.getByRole('link', { name: listName }) }).last()
      .getByTitle('Eliminar lista').click();
    await expect(page.getByRole('link', { name: listName })).toHaveCount(0);
    created.pop();

    expect(errors).toEqual([]);
  } finally {
    for (const id of created) await deleteWishList(request, token, id);
  }
});

test.describe('lista compartida', () => {
  let token: string;
  let list: { id: number; uuid: string; name: string };

  test.beforeEach(async ({ request }) => {
    token = await apiToken(request);
    list = await createWishList(request, token, uniqueName('e2epublica'));
    const response = await retry429(() => request.post(`${API}/product`, {
      headers: bearer(token),
      data: { name: 'Regalo', url_preview: '', url_product: '', price: '10', is_active: 1, wish_list_id: list.id },
    }));
    expect(response.ok()).toBeTruthy();
  });

  test.afterEach(async ({ request }) => {
    await deleteWishList(request, token, list.id);
  });

  test('un visitante la ve por su URL pública y reserva un regalo', async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto(`/@admin/${list.name}`);

    const card = page.locator('app-card').filter({ hasText: 'Regalo' });
    await expect(card).toBeVisible();
    await expect(card.getByTitle('Editar producto')).toHaveCount(0);

    await card.getByTitle('Reservar producto').click();
    await expect(card.getByTitle('Reservado')).toBeVisible();

    await page.reload();
    await expect(page.locator('app-card').getByTitle('Reservado')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('las visitas anónimas cuentan y las del propietario no', async ({ request }) => {
    const views = async (headers = {}) =>
      (await (await retry429(() => request.get(`${API}/wishlist/uuid/${list.uuid}`, { headers }))).json()).wishlist.views as number;

    const start = await views(bearer(token));
    await views();
    await views();
    // the response carries the value read before incrementing, so a new read is needed
    expect(await views(bearer(token))).toBe(start + 2);
  });
});

test('una lista inexistente no rompe la página', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const apiStatus = page.waitForResponse((r) => r.url().includes('/api/wishlist/admin/'));

  await page.goto(`/@admin/${uniqueName('noexiste')}`);

  expect((await apiStatus).status()).toBe(404);
  expect(errors).toEqual([]);
});

test('un usuario inexistente responde 404', async ({ request }) => {
  const response = await retry429(() => request.get(`${API}/wishlist/${uniqueName('noexiste')}`));
  expect(response.status()).toBe(404);
});

test('el formulario de sugerencias llega a la bandeja del administrador', async ({ page, request }) => {
  const token = await apiToken(request);
  const title = uniqueName('Sugerencia E2E ');
  let contactId: number | undefined;

  try {
    await page.goto('/contact?type=suggestion');
    await expect(page.locator('[formcontrolname=type]')).toHaveValue('suggestion');
    await page.locator('[formcontrolname=name]').fill('Visitante');
    await page.locator('[formcontrolname=email]').fill('e2e@example.com');
    await page.locator('[formcontrolname=title]').fill(title);
    await page.locator('[formcontrolname=body]').fill('Mensaje de prueba automática');

    const sent = page.waitForResponse((r) => r.url().endsWith('/api/contact') && r.request().method() === 'POST');
    await page.locator('button[type=submit]').click();
    const response = await sent;
    expect(response.status()).toBe(201);
    const body = await response.json();
    contactId = body.contact?.id;

    await loginUi(page);
    await page.goto('/contact/list');
    // sau-table renders each cell twice: desktop table + hidden mobile card
    await expect(page.getByText(title).locator('visible=true').first()).toBeVisible();
  } finally {
    if (!contactId) {
      const inbox = await (await retry429(() => request.get(`${API}/contact?limit=20`, { headers: bearer(token) }))).json();
      contactId = inbox.list?.find((item: any) => item.title === title)?.id;
    }
    if (contactId) await retry429(() => request.delete(`${API}/contact/${contactId}`, { headers: bearer(token) }));
  }
});
