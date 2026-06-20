import { test, expect } from '@playwright/test'

const EMAIL    = process.env.E2E_EMAIL
const PASSWORD = process.env.E2E_PASSWORD

test('logs in and applies to first offer', async ({ page }) => {
  // Login
  await page.goto('/')
  await page.getByPlaceholder('E-mail').fill(EMAIL)
  await page.getByPlaceholder('Contraseña').fill(PASSWORD)
  await page.getByRole('button', { name: 'Ingresar' }).click()

  // Wait for home
  await page.waitForURL('**/home', { timeout: 15_000 })

  // Click first offer card
  const firstCard = page.locator('.offer-card').first()
  await expect(firstCard).toBeVisible({ timeout: 10_000 })
  await firstCard.click()

  // Wait for offer detail page
  await page.waitForURL('**/ofertas/**', { timeout: 10_000 })

  // Click apply (guard: skip if already applied in a previous run)
  const applyBtn = page.locator('.offer-detail__apply-btn')
  await expect(applyBtn).toBeVisible({ timeout: 10_000 })
  await expect(applyBtn).toBeEnabled({ timeout: 10_000 })
  const currentText = await applyBtn.textContent()
  if (currentText?.trim() !== '✓ Enviado') {
    await applyBtn.click()
  }

  // Assert success
  await expect(applyBtn).toHaveText('✓ Enviado', { timeout: 10_000 })
})
