import { Page, expect } from '@playwright/test';

export async function loginBuyer(page: Page, email = 'buyer@test.com', pass = 'password123') {
  await page.goto('/auth');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  
  // Click login button
  await page.getByRole('button', { name: /sign in|login/i }).click();
  
  // Wait for redirect
  await page.waitForURL('/', { timeout: 10000 });
  await expect(page).toHaveURL('/');
}

export async function loginSeller(page: Page, email = 'seller@test.com', pass = 'password123') {
  await page.goto('/auth');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  
  // Click login button
  await page.getByRole('button', { name: /sign in|login/i }).click();
  
  // Wait for redirect to seller dashboard
  await page.waitForURL(/\/seller/, { timeout: 10000 });
}

export async function loginAdmin(page: Page, email = 'admin@test.com', pass = 'password123') {
  await page.goto('/auth');
  
  await page.waitForLoadState('networkidle');
  
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  
  await page.getByRole('button', { name: /sign in|login/i }).click();
  
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}