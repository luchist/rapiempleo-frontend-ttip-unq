import { test, expect } from '@playwright/test'
import { login } from '../helpers/auth.js'

test.describe('Postulante - Offers', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ─── Apply ────────────────────────────────────────────────────────────────

  test('can apply to an offer', async ({ page }) => {
    const firstCard = page.locator('.offer-card').first()
    await firstCard.click()
    await page.waitForURL('**/ofertas/**', { timeout: 10_000 })

    const applyBtn = page.locator('.offer-detail__apply-btn')
    await expect(applyBtn).toBeVisible({ timeout: 10_000 })

    const currentText = await applyBtn.textContent()
    if (currentText?.trim() !== '✓ Enviado') {
      // Not yet applied — button must be enabled before clicking
      await expect(applyBtn).toBeEnabled()
      await applyBtn.click()
      await page.getByRole('button', { name: 'Aceptar' }).click()
    }

    await expect(applyBtn).toHaveText('✓ Enviado', { timeout: 10_000 })
    await expect(applyBtn).toBeDisabled()
  })

  test('already-applied offer shows sent state on revisit', async ({ page }) => {
    // Establish known state: ensure the first offer is applied
    const firstCard = page.locator('.offer-card').first()
    await firstCard.click()
    await page.waitForURL('**/ofertas/**', { timeout: 10_000 })

    const applyBtn = page.locator('.offer-detail__apply-btn')
    await expect(applyBtn).toBeVisible({ timeout: 10_000 })
    const currentText = await applyBtn.textContent()
    if (currentText?.trim() !== '✓ Enviado') {
      await expect(applyBtn).toBeEnabled()
      await applyBtn.click()
      await page.getByRole('button', { name: 'Aceptar' }).click()
      await expect(applyBtn).toHaveText('✓ Enviado', { timeout: 10_000 })
    }

    // Navigate away and come back — verifies persisted state survives a full page load
    await page.goto('/home')
    await page.waitForURL('**/home', { timeout: 10_000 })
    await page.locator('.offer-card').first().click()
    await page.waitForURL('**/ofertas/**', { timeout: 10_000 })

    const revisitBtn = page.locator('.offer-detail__apply-btn')
    await expect(revisitBtn).toBeVisible({ timeout: 10_000 })
    await expect(revisitBtn).toHaveText('✓ Enviado', { timeout: 10_000 })
    await expect(revisitBtn).toBeDisabled()
  })

  // ─── Search ───────────────────────────────────────────────────────────────

  test('basic keyword search returns results', async ({ page }) => {
    const searchInput = page.locator('.search-bar__input')
    await searchInput.fill('desarrollador')
    await searchInput.press('Enter')

    // Wait for loading to clear and results to update
    await expect(page.locator('.offer-card').first()).toBeVisible({ timeout: 10_000 })
    // Result count hint appears next to "Ofertas" heading when a query is active
    await expect(page.locator('.section-title')).toContainText('resultados')
  })

  test('partial-word search returns relevant results', async ({ page }) => {
    const searchInput = page.locator('.search-bar__input')
    // Smart full-text search: a partial word ("desarroll") should still surface
    // "Desarrollador ..." offers via the boolean-mode prefix wildcard.
    await searchInput.fill('desarroll')
    await searchInput.press('Enter')

    await expect(page.locator('.offer-card').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.section-title')).toContainText('resultados')
  })

  test('search with no matches shows empty state message', async ({ page }) => {
    const searchInput = page.locator('.search-bar__input')
    await searchInput.fill('xyzabc123noresults')
    await searchInput.press('Enter')

    // No cards should be visible
    await expect(page.locator('.offer-card').first()).not.toBeVisible({ timeout: 10_000 })
    // An empty state message should be shown when there are no results
    await expect(page.getByText('(0 resultados)')).toBeVisible({ timeout: 5_000 })
  })

  // ─── Favorites ────────────────────────────────────────────────────────────

  test('can add an offer to favorites', async ({ page }) => {
    // Always use the first card by position — filter locators re-evaluate after DOM changes
    // and would point to a different card once the clicked card becomes favorited.
    const firstCard = page.locator('.offer-card').first()
    await expect(firstCard).toBeVisible({ timeout: 10_000 })

    const heartBtn = firstCard.locator('.offer-card__favorite')
    const heartSvg = firstCard.locator('.offer-card__favorite svg')

    // If already favorited from a previous run, remove it first to get a clean baseline
    const fillBefore = await heartSvg.getAttribute('fill')
    if (fillBefore === 'currentColor') {
      await heartBtn.click()
      await expect(heartSvg).toHaveAttribute('fill', 'none', { timeout: 5_000 })
    }

    await heartBtn.click()

    await expect(heartSvg).toHaveAttribute('fill', 'currentColor', { timeout: 5_000 })
  })

  test('can remove an offer from favorites', async ({ page }) => {
    const firstCard = page.locator('.offer-card').first()
    await expect(firstCard).toBeVisible({ timeout: 10_000 })

    const heartBtn = firstCard.locator('.offer-card__favorite')
    const heartSvg = firstCard.locator('.offer-card__favorite svg')

    // Ensure currently favorited before trying to remove
    const fillBefore = await heartSvg.getAttribute('fill')
    if (fillBefore === 'none') {
      await heartBtn.click()
      await expect(heartSvg).toHaveAttribute('fill', 'currentColor', { timeout: 5_000 })
    }

    await heartBtn.click()
    await expect(heartSvg).toHaveAttribute('fill', 'none', { timeout: 5_000 })
  })

  test('favorited offers appear in profile favorites section', async ({ page }) => {
    // Ensure at least one offer is favorited before navigating to profile
    const favoritedCard = page.locator('.offer-card').filter({
      has: page.locator('.offer-card__favorite svg[fill="currentColor"]'),
    }).first()

    const hasFavorite = await favoritedCard.isVisible()
    if (!hasFavorite) {
      // Add one favorite so the profile section is not empty
      const unfavoritedCard = page.locator('.offer-card').filter({
        has: page.locator('.offer-card__favorite svg[fill="none"]'),
      }).first()
      await unfavoritedCard.locator('.offer-card__favorite').click()
    }

    // Navigate to profile via sidebar
    await page.locator('a.sidebar-icon').filter({ hasText: 'Perfil' }).click()
    await page.waitForURL('**/postulante/**', { timeout: 10_000 })

    // Favorites section must exist and contain at least one offer card
    await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible()
    await expect(page.locator('.postulant-profile__favorite-grid').locator('.offer-card-favorite, .postulant-profile__favorite-slot').first()).toBeVisible()

    // Clicking a favorite should navigate to offer detail
    const firstFavorite = page.locator('.favorite-container').locator('.offer-card-favorite').first()
    const isFavoriteVisible = await firstFavorite.isVisible()
    if (isFavoriteVisible) {
      await firstFavorite.click()
      await page.waitForURL('**/ofertas/**', { timeout: 10_000 })
    }
  })

  // ─── Logout ───────────────────────────────────────────────────────────────

  test('logout redirects to login page', async ({ page }) => {
    await page.locator('.log-out-icon').click()
    await page.waitForURL('**/', { timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
  })
})
