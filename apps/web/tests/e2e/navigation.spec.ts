import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Assuming the application boots up properly
  await expect(page).toHaveTitle(/AMX-ERP/i);
});

test('can navigate to login', async ({ page }) => {
  await page.goto('/');

  // Ensure the page has loaded and a navigation link might be present
  // In a real app this would click a login button and verify URL
  const response = await page.goto('/login');
  expect(response?.status()).toBe(200);
});
