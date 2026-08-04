import { test, expect, } from '@playwright/test';

test.describe('[Page] ServerError;', () => {
  test('The error page should be displayed correctly.', async ({ page, }) => {
    test.setTimeout(10000);
    await page.goto('http://localhost:8888/test');
    await expect(page.getByText('Test Page')).toBeInViewport();
    await page.goto('http://localhost:8888/');
    await expect(page.getByText('There is an internal server error processing the current page.')).toBeInViewport();
    const comeBackButton = page.getByRole('button');
    await comeBackButton.click();
    await expect(page.getByText('Then blocking will end in 7\'500 milliseconds.')).toBeInViewport({ timeout: 9000, });
  });
});
