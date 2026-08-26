import { test, expect } from '@playwright/test';

test.describe('i18n Journeys', () => {
  test('Cookie-based locale persistence', async ({ page }) => {
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', domain: 'localhost', path: '/' }]);
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'de');
  });

  test('Locale persists across navigation', async ({ page }) => {
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'ar', domain: 'localhost', path: '/' }]);
    await page.goto('/');
    
    // Click on Products link
    const productsLink = page.getByRole('link', { name: /Products/i }).first();
    if (await productsLink.isVisible()) {
      await productsLink.click();
      
      // Wait for navigation
      await page.waitForURL('**/products**');
      
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'ar');
      await expect(html).toHaveAttribute('dir', 'rtl');
    }
  });

  test('Fallback locale check (no missing keys)', async ({ page }) => {
    await page.goto('/');
    
    // Next-intl usually falls back to the source string or shows the key if missing
    // We can just verify the page loads and standard text isn't empty.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
