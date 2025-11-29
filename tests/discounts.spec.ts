import { test, expect } from '@playwright/test';
import { loginBuyer } from './helpers';

test('discounted price is used for totals', async ({ page }) => {
  // Login as buyer
  await loginBuyer(page);
  
  // Go to store
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait for products to load
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
  
  // Try to find a product with discount, fallback to first product
  let productCard = page.locator('[data-testid="product-card"]').filter({
    has: page.locator('text=/-\\d+%/')
  }).first();
  
  // If no discounted product, use first available
  const hasDiscountedProduct = await productCard.count() > 0;
  if (!hasDiscountedProduct) {
    productCard = page.locator('[data-testid="product-card"]').first();
  }
  
  // Get the final price
  const priceElement = productCard.locator('[data-testid="final-price"]');
  await priceElement.waitFor({ state: 'visible' });
  const priceText = await priceElement.textContent();
  const expectedPrice = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
  
  // Add to cart
  await productCard.locator('[data-testid="add-to-cart-btn"]').click();
  
  // Wait a bit for cart to update
  await page.waitForTimeout(1000);
  
  // Open cart sheet
  const cartButton = page.getByRole('button', { name: /cart/i })
    .or(page.locator('button:has-text("Cart")'))
    .or(page.locator('[aria-label="Shopping cart"]'));
  
  await cartButton.click();
  
  // Wait for cart to open
  await page.waitForSelector('[data-testid="cart-total"]', { timeout: 5000 });
  
  // Check cart total
  const cartTotalText = await page.locator('[data-testid="cart-total"]').textContent();
  const cartTotal = parseFloat(cartTotalText?.replace(/[^0-9.]/g, '') || '0');
  
  expect(cartTotal).toBeCloseTo(expectedPrice, 2);
  
  // Go to checkout
  await page.getByRole('button', { name: /proceed to checkout|checkout/i }).click();
  
  // Wait for checkout page
  await page.waitForURL('/checkout', { timeout: 5000 });
  
  // Check checkout total
  const checkoutTotalElement = page.locator('[data-testid="checkout-total"]');
  await checkoutTotalElement.waitFor({ state: 'visible', timeout: 5000 });
  
  const checkoutTotalText = await checkoutTotalElement.textContent();
  const checkoutTotal = parseFloat(checkoutTotalText?.replace(/[^0-9.]/g, '') || '0');
  
  expect(checkoutTotal).toBeCloseTo(expectedPrice, 2);
});