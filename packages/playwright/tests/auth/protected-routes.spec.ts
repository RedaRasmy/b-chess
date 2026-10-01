import { test, expect } from '../../fixtures';

test.describe('Protected Routes', () => {
    test('protected routes', async ({ page }) => {
        await page.goto('/profile');
        await expect(page).toHaveURL('/auth/login');

        await page.goto('/multiplayer');
        await expect(page).toHaveURL('/auth/login');

        await page.goto('/multiplayer/play');
        await expect(page).toHaveURL('/auth/login');
    });

    test('protected routes while authenticated', async ({ page, registerPage, credentials }) => {
        // Register
        await registerPage.register(credentials);
        await expect(page).toHaveURL('/profile');

        // Should redirect

        await page.goto('/auth/login');
        await expect(page).toHaveURL('/profile');

        await page.goto('/auth/register');
        await expect(page).toHaveURL('/profile');

        await page.goto('/auth/reset-password');
        await expect(page).toHaveURL('/profile');

        await page.goto('/auth/forgot-password');
        await expect(page).toHaveURL('/profile');

        await page.goto('/auth/goodbye');
        await expect(page).toHaveURL('/profile');

        await page.goto('/onboarding');
        await expect(page).toHaveURL('/profile');

        // Should work

        await page.goto('/multiplayer');
        await expect(page).toHaveURL('/multiplayer');
    });
});
