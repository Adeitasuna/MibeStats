/**
 * E2E Flow 3 — Sales History
 *
 * Navigate to /sales, verify price chart renders, verify sales table has rows.
 */

import { test, expect } from '@playwright/test'

test('Sales History page loads with charts and table', async ({ page }) => {
  await page.goto('/sales')

  // Page heading
  await expect(page.locator('h1')).toContainText('Sales', { timeout: 10_000 })

  // Charts are dynamically imported (ssr: false) — wait for Recharts SVG
  const chartContainer = page.locator('.recharts-responsive-container')
  await expect(chartContainer.first()).toBeVisible({ timeout: 15_000 })

  // Sales table should have at least one data row
  const tableRows = page.locator('table tbody tr, [role="row"]')
  await expect(tableRows.first()).toBeVisible({ timeout: 10_000 })
})
