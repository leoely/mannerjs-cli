import { test, expect, } from '@playwright/test';

test.describe('[Page] NotFound;', () => {
  test('The home page should be displayed correctly.', async ({ page, }) => {
    await page.goto('http://localhost:8888/fadsfdsaj023902/fadsfsad82340u2/');
    await expect(page.getByText('Location')).toBeInViewport();
    await expect(page.getByText('/fadsfdsaj023902/fadsfsad82340u2/')).toBeInViewport();
    await expect(page.getByText('don\'t exist.')).toBeInViewport();
  });
});
