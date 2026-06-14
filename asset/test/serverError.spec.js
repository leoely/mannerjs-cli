import { test, expect, } from '@playwright/test';

test.describe('[Page] ServerError;', () => {
  test('The error page should be displayed correctly.', async ({ page, }) => {
    test.setTimeout(10000);
    await page.goto('http://localhost:8888/test');
    await expect(page.getByText('Test Page')).toBeInViewport();
    await page.goto('http://localhost:8888/');
    await expect(page.getByText('There is an error in the server of the current page.You can inform the the relevant personnel of the website about this situations.Thank you very much.In addition,you can visit other pages.')).toBeInViewport();
    const comeBackButton = page.getByRole('button');
    await comeBackButton.click();
    await expect(page.getByText('There is an error in the server of the current page.You can inform the the relevant personnel of the website about this situations.Thank you very much.In addition,you can visit other pages.')).toBeInViewport({ timeout: 9000, });
  });
});
