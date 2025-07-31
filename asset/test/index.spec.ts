import { test, expect, } from '@playwright/test';

test.describe('[Page] Index;', () => {
  test('The home page should be displayed correctly.', async ({ page, }) => {
    await page.goto('http://localhost:8888/');
    await expect(page.getByAltText('manner.js welcome image')).toBeInViewport();
  });
});
