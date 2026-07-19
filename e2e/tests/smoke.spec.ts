import { test, expect } from '@playwright/test'

test('homepage loads in English', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Calendula/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('homepage loads in Arabic', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    document.cookie = 'NEXT_LOCALE=ar; path=/; max-age=31536000'
  })
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})

test('FAQ page renders', async ({ page }) => {
  await page.goto('/faq')
  await expect(page.locator('h1')).toBeVisible()
})

test('products page loads', async ({ page }) => {
  await page.goto('/products')
  await expect(page.locator('body')).toBeVisible()
})

test('contact page loads with form', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.locator('form')).toBeVisible()
})

test('about page renders', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('h1')).toBeVisible()
})

test('admin login page loads', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.locator('form')).toBeVisible()
})

test('404 page shows for unknown routes', async ({ page }) => {
  await page.goto('/this-does-not-exist')
  await expect(page.locator('body')).toBeVisible()
})
