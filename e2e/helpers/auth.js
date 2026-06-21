import { expect } from '@playwright/test'

if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
  throw new Error('E2E_EMAIL and E2E_PASSWORD must be set in .env.test')
}

const EMAIL = process.env.E2E_EMAIL
const PASSWORD = process.env.E2E_PASSWORD

export async function login(page) {
  await page.goto('/')
  await page.getByPlaceholder('E-mail').fill(EMAIL)
  await page.getByPlaceholder('Contraseña').fill(PASSWORD)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL('**/home', { timeout: 15_000 })
  // Wait for at least one offer card to confirm the page fully loaded
  await expect(page.locator('.offer-card').first()).toBeVisible({ timeout: 10_000 })
}
