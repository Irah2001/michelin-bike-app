import { test, expect } from '@playwright/test';

const TEST_PASSWORD = 'TestPass123!';

test.describe('User Journey', () => {
  test('register and navigate app', async ({ page }) => {
    const email = `e2e_${Date.now()}@test.com`;

    // 1. Login page
    await page.goto('/');
    await expect(page.getByText('Michelin Bike')).toBeVisible();

    // 2. Register
    await page.getByText("Pas de compte ? S'inscrire").click();
    await page.getByPlaceholder('Nom').fill('Test E2E User');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Mot de passe').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: "S'inscrire" }).click();

    // 3. Wait for redirect (onboarding or tires)
    await page.waitForURL(/\/(tires|onboarding)/, { timeout: 10000 });

    // 4. If onboarding, skip it
    if (page.url().includes('onboarding')) {
      await page.getByText('Passer').click();
      await page.waitForTimeout(1000);
    }

    // 5. Should now be on profile page after skip
    await expect(page.getByText('Mon profil')).toBeVisible({ timeout: 5000 });

    // 6. Navigate to Pneus
    await page.locator('a[href="/tires"]').click();
    await expect(page.getByText('Mon équipement')).toBeVisible({ timeout: 5000 });

    // 7. Navigate to Défis
    await page.locator('a[href="/challenges"]').click();
    await expect(page.getByText('Communautés')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('100 000 km en 7 jours')).toBeVisible();
    await expect(page.getByText('Ambassadeur Michelin')).toBeVisible();
    // New user has no tires
    await expect(page.getByText('Pneu connecté requis').first()).toBeVisible();

    // 7. Navigate to Profile
    await page.locator('a[href="/profile"]').click();
    await expect(page.getByText('Mon profil')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Test E2E User')).toBeVisible();
    await expect(page.getByText('Mon classement régional')).toBeVisible();

    // 8. Navigate to Pneus
    await page.locator('a[href="/tires"]').click();
    await expect(page.getByText('Mon équipement')).toBeVisible({ timeout: 5000 });
  });

  test('login with existing user and see data', async ({ page }) => {
    const email = `e2e_login_${Date.now()}@test.com`;

    // Register
    await page.goto('/');
    await page.getByText("Pas de compte ? S'inscrire").click();
    await page.getByPlaceholder('Nom').fill('Login User');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Mot de passe').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: "S'inscrire" }).click();
    await page.waitForURL(/\/(tires|onboarding)/, { timeout: 10000 });

    // Logout
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.goto('/');
    await expect(page.getByText('Michelin Bike')).toBeVisible();

    // Login back
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Mot de passe').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL(/\/(tires|onboarding)/, { timeout: 10000 });
  });
});
