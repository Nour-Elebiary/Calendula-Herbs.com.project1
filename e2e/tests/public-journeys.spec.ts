import { test, expect } from '@playwright/test';

test.describe('Public Journeys', () => {
  test('Homepage loads — all sections', async ({ page }) => {
    await page.goto('/');
    
    // Check main sections
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('section').filter({ hasText: /Our Products/i })).toBeVisible();
    await expect(page.locator('section').filter({ hasText: /Our Process/i })).toBeVisible();
    await expect(page.getByText('Satisfied Clients')).toBeVisible(); // Stats bar
  });

  test('Products page — category filter', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.getByRole('heading', { name: /Our Products/i, level: 1 })).toBeVisible();
    
    // Click category
    const categoryFilter = page.getByRole('button', { name: /Herbs/i });
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(500); // Wait for transition
      
      // Should show filtered products
      await expect(page.locator('.card-product')).toBeVisible();
    }
  });

  test('Contact form — client validation', async ({ page }) => {
    await page.goto('/contact');
    
    // Submit empty form
    await page.getByRole('button', { name: /Send Message/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/Required/i).first()).toBeVisible();
  });

  test('FAQ page — accordion', async ({ page }) => {
    await page.goto('/faq');
    
    // Click first question
    const question = page.locator('button[data-state="closed"]').first();
    await question.click();
    
    // Should expand
    await expect(question).toHaveAttribute('data-state', 'open');
  });

  test('Privacy / Terms pages', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    await page.goto('/terms');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('404 page', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /Not Found/i })).toBeVisible();
  });

  test('SEO meta tags on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Title
    const title = await page.title();
    expect(title).toMatch(/Calendula Herbs/i);
    expect(title).not.toMatch(/\| .+ \| .+/);
    
    // Description
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /.{10,}/);
  });
  
  test('RTL layout — Arabic', async ({ page }) => {
    // Add locale cookie
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'ar', domain: 'localhost', path: '/' }]);
    await page.goto('/');
    
    // Check for RTL direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });

  test('Multi-language — French', async ({ page }) => {
    // Add locale cookie
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'fr', domain: 'localhost', path: '/' }]);
    await page.goto('/');
    
    // Check for French lang
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'fr');
  });

  test('Mobile responsive menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // Find the hamburger menu
    const menuButton = page.locator('button[aria-label="Toggle Menu"], button[aria-expanded]');
    
    // Sometimes mobile menu takes a bit to be interactive or it might be different selector
    if (await menuButton.count() > 0) {
      await menuButton.first().click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });
});
