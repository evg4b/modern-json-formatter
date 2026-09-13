import { expect, test } from './support/fixtures';

test.beforeEach(async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/faq.html`);
});

test('renders the manual with its sidebar', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'JQ Queries Manual' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Basic filters' })).toBeVisible();
});

test('navigates to a section from the sidebar', async ({ page }) => {
  await page.getByRole('link', { name: 'Regular expressions' }).click();

  await expect(page.getByRole('heading', { name: 'Regular expressions' })).toBeInViewport();
});

test('matches the manual page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'JQ Queries Manual' })).toBeVisible();

  await expect(page).toHaveScreenshot('faq.png');
});
