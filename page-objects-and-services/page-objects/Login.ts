export class LoginPage {
  usernameInput = "#username";
  passwordInput = "#password";
  loginButton = "#kc-login";

  // Dynamically load environment variables for Instance 1 and Instance 2 URLs
  instance1LoginUrl = Cypress.env("instance1Login");
  instance2LoginUrl = Cypress.env("instance2Login");

  visitLoginPage() {
    cy.log(`Navigating to Instance 1 Login URL: ${this.instance1LoginUrl}`);
    cy.visit(this.instance1LoginUrl);
  }

  visitHostedLoginPage() {
    cy.log(`Navigating to Instance 2 Login URL: ${this.instance2LoginUrl}`);
    cy.visit(this.instance2LoginUrl);
  }

  enterUsername() {
    const username = Cypress.env("username"); // Load username dynamically
    cy.log(`Entering username: ${username}`);
    cy.get(this.usernameInput).clear().type(username);
  }

  enterPassword() {
    const password = Cypress.env("password"); // Load password dynamically
    cy.log(`Entering password: ${password}`);
    cy.get(this.passwordInput).clear().type(password);
  }

  clickLoginButton() {
    cy.log("Clicking the login button...");
    cy.get(this.loginButton).click();
  }
}