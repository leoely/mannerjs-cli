import { test, expect, } from '@playwright/test';

test.describe('[Page] LatencyTooHigh;', () => {
  test('The latencyTooHigh page should be logically correct.', async ({ page, }) => {
    await page.goto('http://localhost:8888/');
    await expect(page.getByText('The current page is access delay too high due to excessive server load.')).toBeInViewport({ timeout: 8500, });
    const stillVisitButton = page.getByRole('button');
    stillVisitButton.click({ timeout: 8500, });
    await expect(page.getByAltText('manner.js welcome image')).toBeInViewport();
  });
});
