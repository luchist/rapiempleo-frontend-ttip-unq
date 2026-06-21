import { test, expect } from '@playwright/test'
import { login } from '../helpers/auth.js'

test.describe('Postulante - Board', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.locator('a.sidebar-icon').filter({ hasText: 'Tablero' }).click()
    await page.waitForURL('**/board', { timeout: 10_000 })
    await expect(page.locator('.board-page')).toBeVisible({ timeout: 10_000 })
  })

  // ─── Column structure ─────────────────────────────────────────────────────

  test('board shows 5 columns with correct titles', async ({ page }) => {
    // Note: the UI label for EsperandoRespuesta is "En espera"
    const expectedLabels = ['Aplicado', 'Entrevistando', 'En espera', 'Cerrado', 'Aceptado']
    await expect(page.locator('.kanban-column')).toHaveCount(5, { timeout: 10_000 })
    for (const label of expectedLabels) {
      await expect(page.locator('.kanban-column__title', { hasText: label })).toBeVisible()
    }
  })

  test('application cards show company, title and modalidad', async ({ page }) => {
    // Cards may be in any column depending on previous drag actions — find any visible card
    const anyCard = page.locator('.kanban-card').first()
    await expect(anyCard).toBeVisible({ timeout: 10_000 })
    await expect(anyCard.locator('.kanban-card__company')).toBeVisible()
    await expect(anyCard.locator('.kanban-card__title')).toBeVisible()
    await expect(anyCard.locator('.kanban-card__modalidad')).toBeVisible()
  })

  test('column count badge reflects number of cards', async ({ page }) => {
    // Check all 5 columns — count badge must match the actual card count in each
    const columns = page.locator('.kanban-column')
    const count = await columns.count()
    for (let i = 0; i < count; i++) {
      const col = columns.nth(i)
      const cardCount = await col.locator('.kanban-card').count()
      await expect(col.locator('.kanban-column__count')).toHaveText(String(cardCount))
    }
  })

  test('empty columns show placeholder text', async ({ page }) => {
    const columns = page.locator('.kanban-column')
    const count = await columns.count()
    for (let i = 0; i < count; i++) {
      const col = columns.nth(i)
      const cardCount = await col.locator('.kanban-card').count()
      if (cardCount === 0) {
        await expect(col.locator('.kanban-column__empty')).toHaveText('Sin postulaciones')
      }
    }
  })

  // ─── Drag & drop ──────────────────────────────────────────────────────────

  test('can drag a card between columns', async ({ page }) => {
    test.slow()

    const columns = page.locator('.kanban-column')
    const columnCount = await columns.count()

    // Find first non-empty column to use as source
    let sourceIndex = -1
    for (let i = 0; i < columnCount; i++) {
      if (await columns.nth(i).locator('.kanban-card').count() > 0) {
        sourceIndex = i
        break
      }
    }
    if (sourceIndex === -1) {
      test.skip(true, 'No cards on board — apply to an offer first (login-and-apply.spec.js)')
      return
    }

    // Target is the adjacent column (next, or previous if source is the last)
    const targetIndex = sourceIndex < columnCount - 1 ? sourceIndex + 1 : sourceIndex - 1

    const sourceColumn = columns.nth(sourceIndex)
    const targetColumn = columns.nth(targetIndex)
    const card = sourceColumn.locator('.kanban-card').first()
    const cardTitle = await card.locator('.kanban-card__title').textContent()
    const sourceCountBefore = await sourceColumn.locator('.kanban-card').count()
    const targetCountBefore = await targetColumn.locator('.kanban-card').count()

    // @hello-pangea/dnd requires manual mouse events — dragTo() does not trigger its
    // pointer event sequence reliably. Hold briefly after mousedown so the library
    // recognises the gesture, then move in small steps to activate the drop zone.
    const cardBox = await card.boundingBox()
    const targetBox = await targetColumn.locator('.kanban-column__cards').boundingBox()
    const startX = cardBox.x + cardBox.width / 2
    const startY = cardBox.y + cardBox.height / 2
    const endX = targetBox.x + targetBox.width / 2
    const endY = targetBox.y + targetBox.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.waitForTimeout(500)
    await page.mouse.move(endX, endY, { steps: 30 })
    await page.waitForTimeout(300)
    await page.mouse.up()
    await page.waitForTimeout(500)

    await expect(sourceColumn.locator('.kanban-card')).toHaveCount(
      sourceCountBefore - 1, { timeout: 8_000 }
    )
    await expect(targetColumn.locator('.kanban-card')).toHaveCount(
      targetCountBefore + 1, { timeout: 8_000 }
    )
    await expect(
      targetColumn.locator('.kanban-card__title', { hasText: cardTitle })
    ).toBeVisible()

    // Count badges must reflect the new state
    await expect(sourceColumn.locator('.kanban-column__count')).toHaveText(
      String(sourceCountBefore - 1)
    )
    await expect(targetColumn.locator('.kanban-column__count')).toHaveText(
      String(targetCountBefore + 1)
    )
  })
})
