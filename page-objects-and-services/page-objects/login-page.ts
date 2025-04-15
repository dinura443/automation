
export class LoginPage {

  usernameInput = '#username';
  passwordInput = '#password';
  loginButton = '#kc-login';

  visitLoginPage() {
   cy.visit('http://localhost:8088');
  // cy.visit('https://redowl.io');

  }
  visitHostedLoginPage() {
    cy.visit('https://analytics.qbitum.net');
 
   }
  

  enterUsername(username: string) {
    cy.get(this.usernameInput).clear().type(username);
  }

  enterPassword(password: string) {
    cy.get(this.passwordInput).clear().type(password);
  }

  clickLoginButton() {
    cy.get(this.loginButton).click();
  }
}
