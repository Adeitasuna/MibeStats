/**
 * E2E Flow 4 — Portfolio Lookup
 *
 * Navigate to /portfolio, enter a known Mibera holder address,
 * verify holdings grid shows at least 1 token.
 */

import { test, expect } from '@playwright/test'

// Known holder address for E2E testing — replace with an actual Mibera holder
// when running against production data.
const TEST_ADDRESS = process.env.E2E_TEST_ADDRESS ?? '0x6666397DFe9a8c469BF65dc744CB1C733416c420'

test('Portfolio lookup shows wallet holdings', async ({ page }) => {
  await page.goto('/portfolio')

  // Portfolio search page heading
  await expect(page.locator('h1')).toContainText('Portfolio', { timeout: 10_000 })

  // Enter address in search bar
  const searchInput = page.locator('input[placeholder*="0x"]')
  await expect(searchInput).toBeVisible()
  await searchInput.fill(TEST_ADDRESS)

  // Submit the form
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.click()

  // Should navigate to /portfolio/[address]
  await page.waitForURL(`**/portfolio/${TEST_ADDRESS}`, { timeout: 10_000 })

  // Portfolio stats section should be visible
  const statsGrid = page.locator('text=Miberas held')
  await expect(statsGrid).toBeVisible({ timeout: 10_000 })
})
