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

test.describe('Postulante - Preferences Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.locator('a.sidebar-icon').filter({ hasText: 'Perfil' }).click()
    await page.waitForURL('**/postulante/**', { timeout: 10_000 })
    await expect(page.locator('.postulant-profile__preference-block')).toBeVisible({ timeout: 10_000 })
  })

  test('preferences section shows Editar button in view mode', async ({ page }) => {
    const editBtn = page.locator('.postulant-profile__preference-edit-btn')
    await expect(editBtn).toBeVisible()
    await expect(editBtn).toHaveText('Editar')
    await expect(page.locator('.postulant-profile__preference-textarea')).not.toBeVisible()
  })

  test('clicking Editar activates edit mode with textarea and Guardar button', async ({ page }) => {
    await page.locator('.postulant-profile__preference-edit-btn').click()

    await expect(page.locator('.postulant-profile__preference-edit-btn')).toHaveText('Guardar')
    await expect(page.locator('.postulant-profile__preference-textarea')).toBeVisible()
    await expect(page.locator('.postulant-profile__preference-charcount')).toBeVisible()
  })

  test('character counter updates as user types', async ({ page }) => {
    await page.locator('.postulant-profile__preference-edit-btn').click()

    const textarea = page.locator('.postulant-profile__preference-textarea')
    await textarea.clear()
    await textarea.fill('Hola')

    await expect(page.locator('.postulant-profile__preference-charcount')).toHaveText('4/255')
  })

  test('can edit and save preferences', async ({ page }) => {
    const newPreference = 'Busco trabajo remoto en desarrollo web.'

    await page.locator('.postulant-profile__preference-edit-btn').click()

    const textarea = page.locator('.postulant-profile__preference-textarea')
    await textarea.clear()
    await textarea.fill(newPreference)

    const responsePromise = page.waitForResponse(
      res => res.url().includes('/preferencia') && res.request().method() === 'PATCH'
    )
    await page.locator('.postulant-profile__preference-edit-btn').click()
    const response = await responsePromise

    expect(response.status()).toBe(200)
    await expect(page.locator('.postulant-profile__preference-edit-btn')).toHaveText('Editar')
    await expect(page.locator('.postulant-profile__preference-textarea')).not.toBeVisible()
    await expect(page.locator('.postulant-profile__preference-text')).toContainText(newPreference)
  })

  test('saved preferences persist after page reload', async ({ page }) => {
    const persistedPreference = 'Preferencia persistida para validacion e2e.'

    await page.locator('.postulant-profile__preference-edit-btn').click()

    const textarea = page.locator('.postulant-profile__preference-textarea')
    await textarea.clear()
    await textarea.fill(persistedPreference)

    const responsePromise = page.waitForResponse(
      res => res.url().includes('/preferencia') && res.request().method() === 'PATCH'
    )
    await page.locator('.postulant-profile__preference-edit-btn').click()
    await responsePromise

    await page.reload()
    await expect(page.locator('.postulant-profile__preference-block')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.postulant-profile__preference-text')).toContainText(persistedPreference)
  })

  test('textarea enforces 255 character maximum', async ({ page }) => {
    await page.locator('.postulant-profile__preference-edit-btn').click()

    const textarea = page.locator('.postulant-profile__preference-textarea')
    await expect(textarea).toHaveAttribute('maxlength', '255')
  })
})
