import { test, expect } from '@playwright/test';
import { loginSeller } from './helpers';

test('seller quick action navigates to /seller/add-product', async ({ page }) => {
  await loginSeller(page);
  await page.getByRole('button', { name: /add new product/i }).click();
  await expect(page).toHaveURL('/seller/add-product');
  await expect(page.getByRole('heading', { name: /add product/i })).toBeVisible();
});