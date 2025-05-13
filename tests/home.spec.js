const { test, expect } = require('@playwright/test');

test('homepage has title and loads', async ({ page }) => {
  await page.goto('file://' + __dirname + '/../index.html');
  await expect(page).toHaveTitle(/Smart/i);
});