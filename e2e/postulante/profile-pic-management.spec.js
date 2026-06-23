import { test, expect } from '@playwright/test'
import { login } from '../helpers/auth.js'

test.describe('Postulante - Profile Picture Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.locator('a.sidebar-icon').filter({ hasText: 'Perfil' }).click()
    await page.waitForURL('**/postulante/**', { timeout: 10_000 })
    await expect(page.locator('.postulant-profile__cv-grid')).toBeVisible({ timeout: 10_000 })
  })

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
