// @ts-nocheck
import { test, expect } from '@playwright/test'

test('smoke: home loads and sign-in link exists', async ({ page, baseURL }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/KamkmServe|Kamkm/)
  const signIn = page.locator('a', { hasText: 'Sign in' })
  await expect(signIn.first()).toBeVisible()
})
