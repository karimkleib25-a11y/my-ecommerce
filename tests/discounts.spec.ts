import { test, expect } from '@playwright/test';
import { loginBuyer } from './helpers';

test('discounted price is used for totals', async ({ page }) => {
  await loginBuyer(page);

  await page.goto('/');
  // Assume a product with discount badge exists; otherwise, add one via seller flow before this test.
  const discountedCard = page.locator('[data-testid="product-card"]').filter({
    has: page.getByText(/-%|\bdiscount\b/i),
  }).first();

  // Fallback to first card if filter finds none
  const card = (await discountedCard.count()) > 0 ? discountedCard : page.locator('[data-testid="product-card"]').first();

  // Read original and discounted prices shown
  const originalText = await card.locator('[data-testid="original-price"]').textContent().catch(() => null);
  const discountedText = await card.locator('[data-testid="final-price"]').textContent();
  const discounted = Number(discountedText?.replace(/[^0-9.]/g, ''));

  // Add to cart
  await card.getByRole('button', { name: /add to cart/i }).click();

  // Open cart sheet trigger (from header)
  await page.getByRole('button', { name: /cart/i }).click();

  // Cart total equals discounted price
  const cartTotalText = await page.locator('[data-testid="cart-total"]').textContent();
  const cartTotal = Number(cartTotalText?.replace(/[^0-9.]/g, ''));
  expect(cartTotal).toBeCloseTo(discounted, 2);

  // Go to checkout
  await page.getByRole('button', { name: /proceed to checkout/i }).click();
  await expect(page).toHaveURL('/checkout');

  const checkoutTotalText = await page.locator('[data-testid="checkout-total"]').textContent();
  const checkoutTotal = Number(checkoutTotalText?.replace(/[^0-9.]/g, ''));
  expect(checkoutTotal).toBeCloseTo(discounted, 2);
});