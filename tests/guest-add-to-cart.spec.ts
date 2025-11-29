import { test, expect } from '@playwright/test';

test('guest is prompted to login when adding to cart', async ({ page }) => {
  // Go to store page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait for products to load
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
  
  // Find and click first Add to Cart button
  const firstCard = page.locator('[data-testid="product-card"]').first();
  await firstCard.waitFor({ state: 'visible' });
  
  const addToCartBtn = firstCard.locator('[data-testid="add-to-cart-btn"]');
  await addToCartBtn.click();
  
  // Should redirect to auth page
  await page.waitForURL('/auth', { timeout: 5000 });
  await expect(page).toHaveURL('/auth');
  
  // Check for toast message (optional, might be gone by time of check)
  // await expect(page.getByText(/please login/i)).toBeVisible({ timeout: 3000 }).catch(() => {});
});