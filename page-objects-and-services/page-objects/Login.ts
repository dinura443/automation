export class LoginPage {
  usernameInput = "#username";
  passwordInput = "#password";
  loginButton = "#kc-login";

  visitLoginPage() {
    cy.visit(Cypress.env("INSTANCE1_LOGIN"));
  }

  visitHostedLoginPage() {
    cy.visit(Cypress.env("INSTANCE2_LOGIN"));
  }

  enterUsername() {
    cy.get(this.usernameInput).clear().type(Cypress.env("USERNAME"));
  }

  enterPassword() {
    cy.get(this.passwordInput).clear().type(Cypress.env("PASSWORD"));
  }

  clickLoginButton() {
    cy.get(this.loginButton).click();
  }
}