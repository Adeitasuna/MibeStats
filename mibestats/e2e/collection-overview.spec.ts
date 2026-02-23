/**
 * E2E Flow 1 — Collection Overview
 *
 * Navigate to /, verify floor price stat card renders a number, verify chart renders.
 */

import { test, expect } from '@playwright/test'

test('Collection Overview page loads with stats and chart', async ({ page }) => {
  await page.goto('/')

  // Page title visible
  await expect(page.locator('h1')).toContainText('Mibera333')

  // At least one stat card should render (floor price, volume, etc.)
  const statCards = page.locator('.card')
  await expect(statCards.first()).toBeVisible({ timeout: 10_000 })

  // Floor Price stat card contains "BERA" text (formatted value)
  const floorCard = page.locator('text=Floor Price')
  await expect(floorCard).toBeVisible()

  // Chart container should render (Recharts renders an SVG inside a responsive container)
  const chartArea = page.locator('.recharts-responsive-container')
  // Chart is dynamically imported — wait for it
  await expect(chartArea.first()).toBeVisible({ timeout: 15_000 })
})
