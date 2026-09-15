import { type Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { sample } from './support/samples';
import { ui } from './support/ui';

const sectionLinks = 'mjf-sidebar > .menu > mjf-sidebar-link';
const subSectionLinks = 'mjf-sidebar .section > mjf-sidebar-link';

const activeLink = (page: Page) => page
  .locator('mjf-sidebar-link')
  .filter({ has: page.locator('a.active') });

test.describe('the manual', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/faq.html`);
    await expect(page.locator(sectionLinks).first()).toBeVisible();
  });

  test('renders the manual with its sidebar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'JQ Queries Manual' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Basic filters' })).toBeVisible();
  });

  test('lists a sidebar entry for every section', async ({ page }) => {
    const titles = await page.locator('mjf-section h2').allInnerTexts();
    expect(titles.length).toBeGreaterThan(0);

    for (const title of titles) {
      await expect(page.locator(sectionLinks).filter({ hasText: title })).toHaveCount(1);
    }
  });

  test('lists the sub-sections of a section', async ({ page }) => {
    await expect(page.locator(subSectionLinks).filter({ hasText: 'Recursion' })).toHaveCount(1);
  });

  test('navigates to a section from the sidebar', async ({ page }) => {
    await page.getByRole('link', { name: 'Regular expressions' }).click();

    await expect(page.getByRole('heading', { name: 'Regular expressions' })).toBeInViewport();
  });

  test('navigates to a sub-section from the sidebar', async ({ page }) => {
    await page.locator(subSectionLinks).filter({ hasText: 'Recursion' })
      .click();

    await expect(page.getByRole('heading', { name: 'Recursion' })).toBeInViewport();
  });

  test('marks the section that was navigated to', async ({ page }) => {
    await expect(activeLink(page)).toHaveText('Basic filters');

    await page.getByRole('link', { name: 'Hashing', exact: true }).click();

    await expect(activeLink(page)).toHaveText('Hashing');
  });

  test('follows the reader down the page', async ({ page }) => {
    await expect(activeLink(page)).toHaveText('Basic filters');

    await page.locator('mjf-content').evaluate(content => {
      content.scrollTop = content.scrollHeight;
    });

    await expect(activeLink(page)).toHaveCount(1);
    await expect(activeLink(page)).not.toHaveText('Basic filters');
  });

  test('matches the manual page', { tag: '@screenshot' }, async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'JQ Queries Manual' })).toBeVisible();

    await expect(page).toHaveScreenshot('faq.png');
  });
});

test('opens the manual from the query panel', async ({ context, open, shadow }) => {
  await open(sample);
  await (await shadow.find(ui.tab('query'))).click();

  const opened = context.waitForEvent('page');
  await (await shadow.find(ui.manualLink)).click();

  await expect(await opened).toHaveURL(/faq\.html$/);
});
