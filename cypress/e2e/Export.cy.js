// cypress/e2e/login.spec.ts

import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
import { DashBoard } from "../../page-objects-and-services/page-objects/dash-board";

const login = new LoginPage();
const dashboard = new DashBoard();

describe('Exporting A Dashboard', () => {
  it('Should download a dashboard and appear in the files', () => {
    login.visitLoginPage();

    login.enterUsername('dinura');

    login.enterPassword('dinura123');

    login.clickLoginButton();

    dashboard.visitDashboardPage();

    const itemName = 'States Analysis';
    dashboard.findRowByItemName(itemName);

    dashboard.clickShareButtonForRow(itemName);

    dashboard.findRowByItemName(itemName);

    dashboard.clickShareButtonForRow(itemName);

    const downloadDir = '/home/john/Documents/automation/cypress/downloads';
    cy.log(`Files will be downloaded to: ${downloadDir}`);

    cy.log('File download triggered. Check the download directory manually.');
  });
});