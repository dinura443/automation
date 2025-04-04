// cypress/support/page-objects-and-services/login-page.ts

export class LoginPage {
  // Locators for the login page elements
  usernameInput = '#username';
  passwordInput = '#password';
  loginButton = '#kc-login';

  // Method to navigate to the login page
  visitLoginPage() {
    cy.visit('http://localhost:8088/superset/welcome/');
  }

  // Method to enter the username
  enterUsername(username: string) {
    cy.get(this.usernameInput).clear().type(username);
  }

  // Method to enter the password
  enterPassword(password: string) {
    cy.get(this.passwordInput).clear().type(password);
  }

  // Method to click the login button
  clickLoginButton() {
    cy.get(this.loginButton).click();
  }
}
