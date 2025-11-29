import { test, expect } from '@playwright/test';
import { loginSeller } from './helpers';

test('seller dashboard opens and stats render', async ({ page }) => {
  await loginSeller(page);
  await page.goto('/seller/dashboard');
  await expect(page.getByText(/total products/i)).toBeVisible();
  await expect(page.getByText(/total orders/i)).toBeVisible();
  await expect(page.getByText(/total revenue/i)).toBeVisible();
});