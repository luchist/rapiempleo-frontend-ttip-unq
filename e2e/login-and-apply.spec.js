import { test, expect } from '@playwright/test'
import { login } from './helpers/auth.js'

test('logs in and applies to first offer', async ({ page }) => {
  await login(page)

  // Click first offer card
  const firstCard = page.locator('.offer-card').first()
  await firstCard.click()

  // Wait for offer detail page
  await page.waitForURL('**/ofertas/**', { timeout: 10_000 })

  // Click apply (guard: skip if already applied in a previous run)
  const applyBtn = page.locator('.offer-detail__apply-btn')
  await expect(applyBtn).toBeVisible({ timeout: 10_000 })
  const currentText = await applyBtn.textContent()
  if (currentText?.trim() !== '✓ Enviado') {
    await expect(applyBtn).toBeEnabled({ timeout: 10_000 })
    await applyBtn.click()
    await page.getByRole('button', { name: 'Aceptar' }).click()
  }

  // Assert success
  await expect(applyBtn).toHaveText('✓ Enviado', { timeout: 10_000 })
})
