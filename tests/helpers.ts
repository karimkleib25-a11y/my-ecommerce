import { Page, expect } from '@playwright/test';

export async function loginBuyer(page: Page, email = 'buyer@test.com', pass = 'Password123') {
  await page.goto('/auth');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(pass);
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page).toHaveURL('/');
}

export async function loginSeller(page: Page, email = 'seller@test.com', pass = 'Password123') {
  await page.goto('/auth');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(pass);
  await page.getByRole('button', { name: /login/i }).click();
  await page.goto('/seller/dashboard');
  await expect(page).toHaveURL('/seller/dashboard');
}