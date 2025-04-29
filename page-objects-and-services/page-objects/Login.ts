export class LoginPage {
  usernameInput = "#username";
  passwordInput = "#password";
  loginButton = "#kc-login";

  visitLoginPage() {
    cy.visit(Cypress.env("instance1Login"));
  }

  visitHostedLoginPage() {
    cy.visit(Cypress.env("instance2Login"));
  }

  enterUsername() {
    cy.get(this.usernameInput).clear().type(Cypress.env("username"));
  }

  enterPassword() {
    cy.get(this.passwordInput).clear().type(Cypress.env("password"));
  }

  clickLoginButton() {
    cy.get(this.loginButton).click();
  }
}

