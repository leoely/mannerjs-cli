import { test, expect, } from '@playwright/test';

test.describe('[Page] Update;', () => {
  test('The update page should be logically correct.', async ({ page, }) => {
    test.setTimeout(45500);
    await page.goto('http://localhost:8888/');
    await expect(page.getByText('Detect a new version update of this webapp.Whether or not process update?')).toBeInViewport({ timeout: 35000, });
    const updateButton = page.getByRole('button', { name: 'update', });
    await expect(updateButton).toContainText('update', { timeout: 35000, });
    await expect(updateButton).toBeInViewport({ timeout: 35000, });
    const delayButton = page.getByRole('button', { name: 'delay', });
    await expect(delayButton).toContainText('delay until the next eight seconds', { timeout: 35000, });
    await expect(delayButton).toBeInViewport({ timeout: 35000, });
    await delayButton.click({ timeout: 35000, });
    await expect(page.getByText('Detect a new version update of this webapp.Whether or not process update?')).toBeInViewport({ timeout: 45000, });
    await expect(updateButton).toContainText('update', { timeout: 45000, });
    await expect(updateButton).toBeInViewport({ timeout: 45000, });
    await expect(delayButton).toContainText('delay until the next eight seconds', { timeout: 45000, });
    await expect(delayButton).toBeInViewport({ timeout: 45000, });
    await updateButton.click({ timeout: 45500, });
    await expect(page.getByAltText('manner.js welcome image')).toBeInViewport({ timeout: 45500,});
  });
});
