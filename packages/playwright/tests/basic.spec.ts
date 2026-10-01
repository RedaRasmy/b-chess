import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/BChess/);
});

test('redirection to /bot', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/bot');
});
