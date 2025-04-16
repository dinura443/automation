export class LoginPage {
  usernameInput = "#username";
  passwordInput = "#password";
  loginButton = "#kc-login";

  visitLoginPage() {
    cy.visit(Cypress.env("localLoginUrl"));
  }

  visitHostedLoginPage() {
    cy.visit(Cypress.env("hostedLoginUrl"));
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