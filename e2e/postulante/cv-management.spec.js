import { test, expect } from '@playwright/test'
import { login } from '../helpers/auth.js'

// Returns a fresh locator for the first non-favorite loaded CV slot.
// Using a factory avoids stale filter evaluation after React re-renders.
const getNonFavorite = (page) => page.locator('.postulant-profile__cv-slot--loaded').filter({
  hasNot: page.locator('.postulant-profile__cv-slot-star--active'),
}).first()

// Ensures a non-favorite loaded CV exists. Uploads test-cv.pdf if the account only has
// the favorite CV and no extras. Returns the locator for the non-favorite slot.
async function ensureNonFavoriteCV(page) {
  if (await getNonFavorite(page).isVisible()) return getNonFavorite(page)

  const emptySlot = page.locator('.postulant-profile__cv-slot:not(.postulant-profile__cv-slot--loaded)').first()
  if (!await emptySlot.isVisible()) return null

  const loadedCountBefore = await page.locator('.postulant-profile__cv-slot--loaded').count()

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    emptySlot.click(),
  ])
  await fileChooser.setFiles('e2e/fixtures/test-cv.pdf')

  // Wait for the count to increase — simpler and more stable than filtering after re-render
  await expect(page.locator('.postulant-profile__cv-slot--loaded')).toHaveCount(
    loadedCountBefore + 1, { timeout: 10_000 }
  )

  return getNonFavorite(page)
}

test.describe('Postulante - CV Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.locator('a.sidebar-icon').filter({ hasText: 'Perfil' }).click()
    await page.waitForURL('**/postulante/**', { timeout: 10_000 })
    await expect(page.locator('.postulant-profile__cv-grid')).toBeVisible({ timeout: 10_000 })
  })

  // ─── Profile structure ────────────────────────────────────────────────────

  test('profile shows CV section and favorites section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mis CV' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible()
    // All 4 CV slots must be rendered
    await expect(page.locator('.postulant-profile__cv-grid .postulant-profile__cv-slot')).toHaveCount(4)
  })

  // ─── CV modal ─────────────────────────────────────────────────────────────

  test('clicking a loaded CV slot opens the modal with filename', async ({ page }) => {
    const loadedSlot = page.locator('.postulant-profile__cv-slot--loaded').first()
    await expect(loadedSlot).toBeVisible({ timeout: 5_000 })
    await loadedSlot.click()

    await expect(page.locator('.cv-modal__container')).toBeVisible({ timeout: 10_000 })
    // Filename must be shown in the modal header
    await expect(page.locator('.cv-modal__filename')).toBeVisible()
    await expect(page.locator('.cv-modal__filename')).not.toBeEmpty()
  })

  test('modal indicates favorite status of the opened CV', async ({ page }) => {
    const loadedSlot = page.locator('.postulant-profile__cv-slot--loaded').first()
    await loadedSlot.click()
    await expect(page.locator('.cv-modal__container')).toBeVisible({ timeout: 10_000 })

    const starBtn = page.locator('.cv-modal__star')
    await expect(starBtn).toBeVisible()

    // The star button is disabled when the CV is already the favorite, enabled otherwise
    const isFavorito = await starBtn.isDisabled()
    if (isFavorito) {
      await expect(starBtn).toHaveClass(/cv-modal__star--active/)
    } else {
      await expect(starBtn).not.toHaveClass(/cv-modal__star--active/)
    }
  })

  test('can mark a CV as favorite from the modal', async ({ page }) => {
    const nonFavoriteSlot = await ensureNonFavoriteCV(page)
    if (!nonFavoriteSlot) {
      test.skip(true, 'All 4 CV slots are loaded and all are favorites — cannot upload more')
      return
    }

    // Capture filename before opening so we can find the slot again after the star changes
    const filename = await nonFavoriteSlot.locator('.postulant-profile__cv-slot-name').textContent()
    await nonFavoriteSlot.click()
    await expect(page.locator('.cv-modal__container')).toBeVisible({ timeout: 10_000 })

    const starBtn = page.locator('.cv-modal__star')
    await expect(starBtn).toBeEnabled({ timeout: 5_000 })
    await starBtn.click()

    // Star must become active and disabled after setting as favorite
    await expect(starBtn).toHaveClass(/cv-modal__star--active/, { timeout: 5_000 })
    await expect(starBtn).toBeDisabled()

    // Close modal and verify the specific slot (by filename) now shows the active star
    await page.locator('.cv-modal__close').click()
    await expect(page.locator('.cv-modal__container')).not.toBeVisible()
    const markedSlot = page.locator('.postulant-profile__cv-slot--loaded').filter({
      has: page.locator(`.postulant-profile__cv-slot-name:text("${filename}")`),
    })
    await expect(markedSlot.locator('.postulant-profile__cv-slot-star--active')).toBeVisible({ timeout: 5_000 })
  })

  test('closing the modal via the close button dismisses it', async ({ page }) => {
    const loadedSlot = page.locator('.postulant-profile__cv-slot--loaded').first()
    await loadedSlot.click()
    await expect(page.locator('.cv-modal__container')).toBeVisible({ timeout: 10_000 })

    await page.locator('.cv-modal__close').click()
    await expect(page.locator('.cv-modal__container')).not.toBeVisible()
  })

  // ─── CV delete ────────────────────────────────────────────────────────────

  test('can delete the favorite CV and star auto-reassigns to another CV', async ({ page }) => {
    // Correct behavior: backend deletes the favorite CV and automatically promotes another loaded
    // CV to favorite. Requires at least one other loaded CV for reassignment to occur.
    const nonFavorite = await ensureNonFavoriteCV(page)
    if (!nonFavorite) {
      test.skip(true, 'Only one CV slot in use and it is the favorite — cannot verify star reassignment')
      return
    }

    const favoriteSlot = page.locator('.postulant-profile__cv-slot--loaded').filter({
      has: page.locator('.postulant-profile__cv-slot-star--active'),
    }).first()
    await expect(favoriteSlot).toBeVisible({ timeout: 5_000 })

    const favoriteName = await favoriteSlot.locator('.postulant-profile__cv-slot-name').textContent()
    const loadedCountBefore = await page.locator('.postulant-profile__cv-slot--loaded').count()

    await favoriteSlot.locator('.postulant-profile__cv-slot-remove').click()
    await page.waitForTimeout(1_500)

    // The favorite must be deleted — count decreases by 1
    await expect(page.locator('.postulant-profile__cv-slot--loaded')).toHaveCount(
      loadedCountBefore - 1, { timeout: 5_000 }
    )
    // The deleted CV must no longer appear
    await expect(page.locator('.postulant-profile__cv-slot-name', { hasText: favoriteName })).not.toBeVisible()
    // The star must be auto-assigned to some remaining loaded CV
    await expect(page.locator('.postulant-profile__cv-slot-star--active')).toBeVisible({ timeout: 5_000 })
  })

  test('can delete a non-favorite CV and the slot is freed', async ({ page }) => {
    const nonFavoriteSlot = await ensureNonFavoriteCV(page)
    if (!nonFavoriteSlot) {
      test.skip(true, 'All 4 CV slots are loaded and all are favorites — cannot upload more')
      return
    }

    const loadedCountBefore = await page.locator('.postulant-profile__cv-slot--loaded').count()
    await nonFavoriteSlot.locator('.postulant-profile__cv-slot-remove').click()

    // Slot count must decrease by 1
    await expect(page.locator('.postulant-profile__cv-slot--loaded')).toHaveCount(
      loadedCountBefore - 1,
      { timeout: 5_000 }
    )
    // Total slot count stays at 4 (a null/empty slot is added back)
    await expect(page.locator('.postulant-profile__cv-grid .postulant-profile__cv-slot')).toHaveCount(4)
  })

  // ─── CV upload ────────────────────────────────────────────────────────────

  test('can upload a CV to an empty slot', async ({ page }) => {
    const emptySlot = page.locator('.postulant-profile__cv-slot:not(.postulant-profile__cv-slot--loaded)').first()

    const hasEmpty = await emptySlot.isVisible()
    if (!hasEmpty) {
      test.skip(true, 'No empty CV slot available — delete a non-favorite CV first to free a slot')
      return
    }

    const loadedCountBefore = await page.locator('.postulant-profile__cv-slot--loaded').count()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      emptySlot.click(),
    ])
    await fileChooser.setFiles('e2e/fixtures/test-cv.pdf')

    // Slot must transition to loaded state
    await expect(page.locator('.postulant-profile__cv-slot--loaded')).toHaveCount(
      loadedCountBefore + 1,
      { timeout: 10_000 }
    )
  })

  // ─── Profile picture ──────────────────────────────────────────────────────

  test('uploading a non-image file as profile picture shows a validation error', async ({ page }) => {
    // Client-side validation in handleProfilePicChange rejects any file whose MIME type is not
    // image/jpeg or image/png. We reuse test-cv.pdf (application/pdf) as the invalid file.
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.profile-pic__overlay').click(),
    ])
    await fileChooser.setFiles('e2e/fixtures/test-cv.pdf')

    await expect(page.locator('.postulant-profile__alerts-wrapper')).toContainText(
      'Solo se permiten archivos JPG o PNG de hasta 5 MB.', { timeout: 5_000 }
    )
  })

  test('can upload a valid image as profile picture', async ({ page }) => {
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.profile-pic__overlay').click(),
    ])

    // Register response waiter before setFiles so the POST isn't missed
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/foto') && res.request().method() === 'POST'
    )
    await fileChooser.setFiles('e2e/fixtures/test-image.jpg')
    const response = await responsePromise

    // Backend accepted the upload
    expect(response.status()).toBe(200)
    // Client-side validation did not fire (complements the invalid-file test)
    await expect(page.locator('.postulant-profile__alerts-wrapper')).not.toContainText(
      'Solo se permiten archivos JPG o PNG de hasta 5 MB.'
    )
    // Profile picture is visible after upload
    await expect(page.locator('.profile-pic__img')).toBeVisible({ timeout: 10_000 })
  })
})
