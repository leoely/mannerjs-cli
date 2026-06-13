import { test, expect, } from '@playwright/test';

test.describe('[Page] Update;', () => {
  test('The update page should be displayed correctly.', async ({ page, }) => {
    await page.goto('http://localhost:8888/');
    await expect(page.getByText('Detect a new version update of this webapp.Whether or not process update?')).toBeInViewport({ timeout: 35000, });
    await expect(page.getByRole('button', { name: 'update', })).toContainText('update', { timeout: 35000, });
    await expect(page.getByRole('button', { name: 'delay', })).toContainText('delay until the next thirty minutes', { timeout: 35000, });
  });
});
