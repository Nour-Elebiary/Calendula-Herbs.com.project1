import { test, expect } from '@playwright/test';

test('security headers present on all page responses', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response!.headers();

  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  // It may be 'max-age=31536000; includeSubDomains; preload' etc.
  expect(headers['strict-transport-security']).toMatch(/max-age=\d+/);
  expect(headers['content-security-policy']).toBeTruthy();

  // Assert CSP does NOT contain unsafe-eval in production
  if (process.env.NODE_ENV === 'production') {
    expect(headers['content-security-policy']).not.toContain("'unsafe-eval'");
  }
});
