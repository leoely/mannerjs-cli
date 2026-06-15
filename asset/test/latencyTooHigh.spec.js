import { test, expect, } from '@playwright/test';

test.describe('[Page] LatencyTooHigh;', () => {
  test('The latencyTooHigh page should be logically correct.', async ({ page, }) => {
    await page.goto('http://localhost:8888/');
    await expect(page.getByText('Due to the high access delay caused by the high load of server,it is recommended to visit the website during off-peak hours to improve the user experience.')).toBeInViewport({ timeout: 8500, });
    const stillVisitButton = page.getByRole('button');
    stillVisitButton.click({ timeout: 8500, });
    await expect(page.getByAltText('manner.js welcome image')).toBeInViewport();
  });
});
