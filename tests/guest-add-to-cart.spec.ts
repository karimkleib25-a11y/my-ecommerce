import { test, expect } from '@playwright/test';

test('guest is prompted to login when adding to cart', async ({ page }) => {
  await page.goto('/');
  // Click first product card add-to-cart button
  const card = page.locator('[data-testid="product-card"]').first();
  await card.getByRole('button', { name: /add to cart/i }).click();

  // Expect toast and redirect to auth
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByText(/please login to add items to cart/i)).toBeVisible();
});