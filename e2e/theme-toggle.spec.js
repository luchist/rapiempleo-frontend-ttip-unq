import { test, expect } from '@playwright/test'
import { login } from './helpers/auth.js'

test('toggles between dark and light mode and persists the choice', async ({ page }) => {
  await login(page)

  const html = page.locator('html')

  // Defaults to the dark theme on first visit (no stored preference)
  await expect(html).toHaveAttribute('data-theme', 'dark')
  const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

  // Toggle to light mode via the sidebar button
  const toggle = page.locator('.theme-toggle-icon')
  await expect(toggle).toBeVisible()
  await toggle.click()

  await expect(html).toHaveAttribute('data-theme', 'light')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('theme')))
    .toBe('light')

  // The token layer actually repaints the surface
  const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(lightBg).not.toBe(darkBg)

  // Preference survives a full reload
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  // Toggle back to dark
  await page.locator('.theme-toggle-icon').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
