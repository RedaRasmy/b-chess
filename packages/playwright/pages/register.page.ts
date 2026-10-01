import { type Locator, type Page } from '@playwright/test';

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
}

export class RegisterPage {
    readonly usernameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly registerButton: Locator;
    readonly termsCheckbox: Locator;

    constructor(private readonly page: Page) {
        this.usernameInput = page.getByPlaceholder(/enter your username/i);
        this.emailInput = page.getByPlaceholder('Enter your email');
        this.passwordInput = page.getByPlaceholder('Create a password');
        this.confirmPasswordInput = page.getByPlaceholder('Confirm your password');
        this.registerButton = page.getByRole('button', { name: /create account/i });
        this.termsCheckbox = page.getByRole('checkbox', { name: /agree to the/i });
    }

    async goto() {
        await this.page.goto('/');
        await this.page.getByText(/sign in/i).click();
        await this.page.getByText(/sign up/i).click();
    }

    async fillForm({ username, email, password }: RegisterCredentials) {
        await this.usernameInput.fill(username);
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(password);
        await this.termsCheckbox.check();
    }

    async submit() {
        await this.registerButton.click();
    }

    async register(credentials: RegisterCredentials) {
        await this.fillForm(credentials);
        await this.submit();
    }
}
