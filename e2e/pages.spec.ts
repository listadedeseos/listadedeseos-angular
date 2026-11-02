import { expect } from '@playwright/test';
import { loginUi, test, watchForErrors } from './helpers';

const WIDTHS = [1440, 375];

const PUBLIC_PAGES = ['/dashboard', '/contact', '/login', '/register'];
const ADMIN_PAGES = ['/list', '/profile', '/user', '/contact/list', '/stats/steam', '/stats/amazon', '/stats/products'];

async function expectHealthyPage(page: import('@playwright/test').Page, errors: string[]) {
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'scroll horizontal de la página').toBeLessThanOrEqual(0);
}

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const path of PUBLIC_PAGES) {
      test(`anónimo: ${path}`, async ({ page }) => {
        const errors = watchForErrors(page);
        await page.goto(path);
        await expectHealthyPage(page, errors);
      });
    }

    for (const path of ADMIN_PAGES) {
      test(`admin: ${path}`, async ({ page }) => {
        await loginUi(page);
        const errors = watchForErrors(page);
        await page.goto(path);
        await expect(page).toHaveURL(new RegExp(path));
        await expectHealthyPage(page, errors);
      });
    }
  });
}
