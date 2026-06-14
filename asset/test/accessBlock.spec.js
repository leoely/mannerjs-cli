import { test, expect, } from '@playwright/test';

test.describe('[Page] AcessBlock;', () => {
  test('The accessBlock page should be logically correct.', async ({ page, }) => {
    await page.goto('http://localhost:8888/');
    await page.goto('http://localhost:8888/');
    await expect(page.getByText('The current IP ::1 is blocked due to frequent acess.Then blocking will end in 7\'500 milliseconds.')).toBeInViewport();
    await expect(page.getByAltText('manner.js welcome image')).toBeInViewport({ timeout : 9000, });
  });
});
