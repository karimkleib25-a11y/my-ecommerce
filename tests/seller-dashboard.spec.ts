import { test, expect } from '@playwright/test';
import { loginSeller } from './helpers';

test('seller dashboard opens and stats render', async ({ page }) => {
  // Login as seller
  await loginSeller(page);
  
  // Go to dashboard
  await page.goto('/seller/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Wait for dashboard to load
  await page.waitForSelector('text=/total products/i', { timeout: 10000 });
  
  // Check all stat cards are visible
  await expect(page.getByText(/total products/i)).toBeVisible();
  await expect(page.getByText(/total orders/i)).toBeVisible();
  await expect(page.getByText(/total revenue/i)).toBeVisible();
  await expect(page.getByText(/average rating/i).or(page.getByText(/avg rating/i))).toBeVisible();
  
  // Check quick action buttons exist
  const addProductLink = page.getByRole('link', { name: /add new product/i })
    .or(page.getByRole('button', { name: /add new product/i }));
  await expect(addProductLink).toBeVisible();
});