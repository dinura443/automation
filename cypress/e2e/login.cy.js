// cypress/e2e/login.spec.ts

import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
const login = new LoginPage();
describe('Login Page Test', () => {
  it('Should successfully log in with valid credentials', () => {
    // Step 1: Visit the login page
    login.visitLoginPage();

    // Step 2: Enter the username
    login.enterUsername('dinura');

    // Step 3: Enter the password
    login.enterPassword('dinura123');

    // Step 4: Click the login button
    login.clickLoginButton();

    // Step 5: Verify successful login (add assertions based on your application)
    // For example, if the login redirects to a dashboard page:
    //cy.url().should('include', '/dashboard'); // Replace with the actual URL after login
  });
});