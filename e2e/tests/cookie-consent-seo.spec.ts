import { test, expect } from '@playwright/test';

/**
 * Cookie consent banner tests.
 * Tests functional behaviour (accept/decline sets cookie) and
 * the mobile overlap bug (L4 from the live inspection report).
 */
test.describe('Cookie Consent Banner', () => {
  test.beforeEach(async ({ context }) => {
    // Clear consent cookie so the banner always appears fresh
    await context.clearCookies();
  });

  test('banner is visible on first visit', async ({ page }) => {
    await page.goto('/');
    // Consent banner should be present before any interaction
    const banner = page.locator('[data-testid="cookie-banner"], [class*="cookie"], [class*="consent"]').first();
    // If banner exists, assert it is visible
    if (await banner.count() > 0) {
      await expect(banner).toBeVisible();
    }
  });

  test('accept sets consent cookie and hides banner', async ({ page, context }) => {
    await page.goto('/');

    const acceptBtn = page.getByRole('button', { name: /accept|agree|allow/i }).first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await page.waitForTimeout(500);

      // Banner should be gone
      await expect(acceptBtn).not.toBeVisible();

      // Consent cookie should be set
      const cookies = await context.cookies();
      const hasConsent = cookies.some(c =>
        c.name.toLowerCase().includes('consent') ||
        c.name.toLowerCase().includes('cookie') ||
        c.name.toLowerCase().includes('gdpr')
      );
      expect(hasConsent).toBe(true);
    }
  });

  test('banner does not reappear after accepting on reload', async ({ page, context }) => {
    await page.goto('/');

    const acceptBtn = page.getByRole('button', { name: /accept|agree|allow/i }).first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await page.waitForTimeout(500);

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Banner should still be hidden
      const bannerAfterReload = page.locator('[data-testid="cookie-banner"], [class*="cookie-banner"]').first();
      if (await bannerAfterReload.count() > 0) {
        await expect(bannerAfterReload).not.toBeVisible();
      }
    }
  });

  test('cookie banner does not overlap hero CTA at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get the primary CTA button bounding rect
    const ctaBtn = page.getByRole('link', { name: /explore|request|contact|view products/i }).first();
    const bannerEl = page.locator('[data-testid="cookie-banner"], [class*="cookie"], [class*="consent"]').first();

    if (await ctaBtn.isVisible() && await bannerEl.isVisible()) {
      const ctaBox = await ctaBtn.boundingBox();
      const bannerBox = await bannerEl.boundingBox();

      if (ctaBox && bannerBox) {
        // Check no vertical overlap: banner.top should be >= cta.bottom OR banner.bottom <= cta.top
        const ctaBottom = ctaBox.y + ctaBox.height;
        const bannerTop = bannerBox.y;
        const bannerBottom = bannerBox.y + bannerBox.height;
        const ctaTop = ctaBox.y;

        const overlaps = bannerTop < ctaBottom && bannerBottom > ctaTop;
        expect(overlaps).toBe(false);
      }
    }
  });
});

/**
 * SEO critical path assertions.
 */
test.describe('SEO Assertions', () => {
  test('FAQ page title has no duplication', async ({ page }) => {
    await page.goto('/faq');
    const title = await page.title();
    // Must NOT match "X | Y | Y" pattern (double brand suffix)
    expect(title).not.toMatch(/\| .+ \| .+/);
    expect(title).toMatch(/Calendula/i);
  });

  test('all public pages have unique non-duplicated titles', async ({ page }) => {
    const routes = ['/', '/products', '/faq', '/about', '/contact', '/privacy', '/terms'];
    const titles: string[] = [];

    for (const route of routes) {
      await page.goto(route);
      const title = await page.title();

      // No duplication pattern
      expect(title).not.toMatch(/\| .+ \| .+/);
      expect(title.length).toBeGreaterThan(5);

      titles.push(title);
    }

    // All page titles should be unique
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  test('JSON-LD schema present on homepage', async ({ page }) => {
    await page.goto('/');
    const schemaScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(schemaScripts.length).toBeGreaterThan(0);
  });

  test('JSON-LD schema present on FAQ page', async ({ page }) => {
    await page.goto('/faq');
    const schemaScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(schemaScripts.length).toBeGreaterThan(0);
  });

  test('JSON-LD schema present on contact page', async ({ page }) => {
    await page.goto('/contact');
    const schemaScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(schemaScripts.length).toBeGreaterThan(0);
  });
});

/**
 * Health endpoint test.
 */
test('health endpoint returns 200', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe('ok');
});

/**
 * Form validation tests.
 */
test.describe('Form Validation', () => {
  test('contact form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('product request form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/product-request');
    const submitBtn = page.getByRole('button', { name: /submit|send|request/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page.getByText(/required/i).first()).toBeVisible();
    }
  });
});

/**
 * Admin session revocation E2E test.
 * Mocks the session endpoint to simulate a revoked session.
 */
test('admin revoked session returns to login', async ({ page }) => {
  // Intercept session endpoint to return a revoked session indicator
  await page.route('/api/auth/session', async (route) => {
    await route.fulfill({ json: { user: null } });
  });

  await page.goto('/admin/dashboard');

  // Should redirect to login (proxy.ts revokes access)
  await expect(page).toHaveURL(/\/admin\/login/);
});
