import { test as base } from '@playwright/test';
import { RegisterPage, type RegisterCredentials } from './pages/register.page';
import { getCredentials } from './utils/credentials';

type Fixtures = {
    credentials: RegisterCredentials;
    registerPage: RegisterPage;
};

export const test = base.extend<Fixtures>({
    credentials: async ({}, use, testInfo) => {
        // workerIndex avoids collisions when tests start in the same millisecond
        await use(getCredentials(Date.now() + testInfo.workerIndex));
    },

    registerPage: async ({ page }, use) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await use(registerPage);
    },
});

export { expect } from '@playwright/test';
