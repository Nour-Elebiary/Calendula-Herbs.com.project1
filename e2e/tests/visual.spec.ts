import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage desktop — visual', async ({ page }) => {
    await page.goto('/');
    // We might have images that lazy load, so we wait for network idle
    await page.waitForLoadState('networkidle');
    // Using maxDiffPixels to allow for minor rendering differences across OS
    await expect(page).toHaveScreenshot('homepage-desktop.png', { maxDiffPixels: 200, fullPage: true });
  });

  test('homepage mobile — visual', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-mobile.png', { maxDiffPixels: 200, fullPage: true });
  });

  test('products page — visual', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('products-desktop.png', { maxDiffPixels: 200, fullPage: true });
  });

  test('admin login page — visual', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('admin-login.png', { maxDiffPixels: 100, fullPage: true });
  });

  test('contact page RTL — visual', async ({ page }) => {
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'ar', domain: 'localhost', path: '/' }]);
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('contact-ar-rtl.png', { maxDiffPixels: 200, fullPage: true });
  });

  test('FAQ page — visual', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('faq-desktop.png', { maxDiffPixels: 200, fullPage: true });
  });
});
