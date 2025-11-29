import { test, expect } from '@playwright/test';
import { loginSeller } from './helpers';

test('seller quick action navigates to /seller/add-product', async ({ page }) => {
  // Login as seller
  await loginSeller(page);
  
  // Go to seller dashboard
  await page.goto('/seller/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Find and click Add New Product button
  const addProductBtn = page.getByRole('link', { name: /add new product/i })
    .or(page.getByRole('button', { name: /add new product/i }));
  
  await addProductBtn.click();
  
  // Should navigate to add product page
  await page.waitForURL('/seller/add-product', { timeout: 5000 });
  await expect(page).toHaveURL('/seller/add-product');
  
  // Check for form elements
  await expect(page.getByText(/add product/i)).toBeVisible();
});