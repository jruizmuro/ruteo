import { expect, test } from '@playwright/test'

test('la landing se renderiza con el CTA principal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Ruteo' })).toBeVisible()
  await expect(page.getByRole('link', { name: /planificar mi ruta/i })).toBeVisible()
})
