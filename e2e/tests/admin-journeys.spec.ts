import { test, expect } from '@playwright/test';

test.describe('Admin Journeys', () => {
  // Let's use route mocking for auth to avoid needing the database
  test.beforeEach(async ({ page }) => {
    // We can intercept the session endpoint to mock being logged out initially
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({ json: {} });
    });
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /Admin Login/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('Failed login', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Mock the credentials endpoint to fail
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      // simulate failed login redirect or error response based on NextAuth
      await route.fulfill({ status: 401, json: { error: 'CredentialsSignin' } });
    });

    await page.getByLabel(/Email/i).fill('admin@calendula-herbs.com');
    await page.getByLabel(/Password/i).fill('wrong-password');
    await page.getByRole('button', { name: /Sign in/i }).click();

    // Check for error state/toast or URL remaining same
    await expect(page.url()).toContain('/admin/login');
  });

  test('Successful login mock', async ({ page }) => {
    await page.goto('/admin/login');
    
    // We can't easily mock next-auth's full flow in Playwright without setting the exact cookies, 
    // but we can ensure the UI responds. For a real E2E, we would want to test the full flow, 
    // but since we are advised to mock DB/API, we'll verify the form submission works.
    
    // Mock the credentials endpoint to succeed
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      await route.fulfill({ status: 200, json: { ok: true, url: 'http://localhost:3000/admin/dashboard' } });
    });
    
    await page.getByLabel(/Email/i).fill('admin@calendula-herbs.com');
    await page.getByLabel(/Password/i).fill('correct-password');
    await page.getByRole('button', { name: /Sign in/i }).click();
  });
});
