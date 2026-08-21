import { expect, test } from '@playwright/test';

test('public entry point has branded metadata and security headers', async ({ page }) => {
  const response = await page.goto('/');
  await expect(page).toHaveTitle(/CampusBites/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  expect(response?.headers()['x-frame-options']).toBe('DENY');
  expect(response?.headers()['permissions-policy']).toContain('geolocation=()');
});

test('keyboard users can reveal and activate the skip link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page).toHaveURL(/\/#main-content$/);
});

test('not-found and unauthorized screens provide safe navigation', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.getByRole('heading', { name: 'That page is off the menu.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
  await page.goto('/unauthorized');
  await expect(page.getByRole('heading', { name: 'This area belongs to another role.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to your portal' })).toHaveAttribute('href', '/login');
});

test('offline state is announced without hiding the current page', async ({ page, context }) => {
  await page.goto('/');
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByText(/You are offline/)).toBeVisible();
  await context.setOffline(false);
});

test('authentication pages remain usable at the configured viewport', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in to CampusBites' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  expect((await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth))).toBe(true);
});
