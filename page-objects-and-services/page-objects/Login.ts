export class LoginPage {
  usernameInput = "#username";
  passwordInput = "#password";
  loginButton = "#kc-login";

  // Visit the login page for Instance 1
  visitLoginPage() {
    cy.visit(Cypress.env("instance1Login"));
  }

  // Visit the login page for Instance 2
  visitHostedLoginPage() {
    cy.visit(Cypress.env("instance2Login"));
  }

  // Enter the username
  enterUsername() {
    cy.get(this.usernameInput).clear().type(Cypress.env("username"));
  }

  // Enter the password
  enterPassword() {
    cy.get(this.passwordInput).clear().type(Cypress.env("password"));
  }

  // Click the login button
  clickLoginButton() {
    cy.get(this.loginButton).click();
  }
}