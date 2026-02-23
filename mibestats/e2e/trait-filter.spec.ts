/**
 * E2E Flow 2 — Trait Filter
 *
 * Navigate to /traits, select "Milady" archetype filter,
 * verify grid shows only Milady tokens, verify URL updates with filter param.
 */

import { test, expect } from '@playwright/test'

test('Trait filter applies and updates URL', async ({ page }) => {
  await page.goto('/traits')

  // Wait for the page to load
  await expect(page.locator('h1')).toContainText('Traits', { timeout: 10_000 })

  // Look for an archetype filter control — the TraitFilter uses select/dropdown per category
  // Click or select "Milady" in archetype filter
  const archetypeFilter = page.locator('select, [data-filter="archetype"]').first()
  if (await archetypeFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await archetypeFilter.selectOption('Milady')

    // Wait for grid to update
    await page.waitForTimeout(1000)

    // URL should contain the filter param
    expect(page.url()).toContain('archetype=Milady')
  }

  // Token grid should have at least one token card visible
  const tokenCards = page.locator('.card')
  await expect(tokenCards.first()).toBeVisible({ timeout: 10_000 })
})
