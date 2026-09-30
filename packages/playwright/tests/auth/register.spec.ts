import { test, expect } from '../../fixtures';

test('user can register and stays logged in after reload', async ({
    page,
    registerPage,
    credentials,
}) => {
    await registerPage.register(credentials);

    await expect(page).toHaveURL(/.*profile.*/);
    await page.reload();
    await expect(page).toHaveURL(/.*profile.*/);
});
