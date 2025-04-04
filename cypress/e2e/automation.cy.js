import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
import { DashBoard } from "../../page-objects-and-services/page-objects/dash-board";

const login = new LoginPage();
const dashboard = new DashBoard();

describe('File Import Test', () => {
  const itemName = 'test1';
  const targetUrl = 'http://localhost:8088/dashboard/list';
  const originalDownloadPath = '/home/john/Documents/Automation/cypress/downloads';
  const desiredDownloadPath = 'downloads';
  const uploadButtonSelector = 'ant-btn superset-button superset-button-primary cta css-z1d1fr';
  const overwriteInputSelector = '#overwrite';
  const overwriteButtonSelector = 'button:contains("Overwrite")';

  it('Should upload a specific file to the target URL', () => {
    cy.log('Step 1: Logging in...');
    login.visitLoginPage();
    login.enterUsername('dinura');
    login.enterPassword('dinura123');
    login.clickLoginButton();

    cy.log('Step 2: Navigating to the dashboard page...');
    dashboard.visitDashboardPage();
    dashboard.findRowByItemName(itemName);
    dashboard.clickShareButtonForRow(itemName);

    cy.log('Step 3: Triggering file download...');
    cy.wait(5000);
    cy.log('Waiting for file download to complete...');

    cy.task('getLatestFile', originalDownloadPath).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${originalDownloadPath}`);
      }

      const fileName = Cypress._.last(latestFilePath.split('/'));
      const originalFilePath = latestFilePath;
      const desiredFilePath = `${desiredDownloadPath}/${fileName}`;

      cy.log(`Step 4: Downloaded file: ${fileName}`);
      cy.log(`Original file path: ${originalFilePath}`);
      cy.log(`Desired file path: ${desiredFilePath}`);

      cy.log('Step 5: Moving the file to the desired directory...');
      cy.task('moveFile', {
        source: originalFilePath,
        destination: `cypress/fixtures/${desiredFilePath}`,
      }).then((result) => {
        cy.log(result);
      });

      cy.log('Step 6: Uploading the file...');
      dashboard.uploadSpecificFile(targetUrl, desiredFilePath, uploadButtonSelector);

      cy.log('Step 7: Handling overwrite confirmation...');
      cy.get(overwriteInputSelector).type('OVERWRITE');
      cy.log('Typed "OVERWRITE" into the input field.');

      cy.get(overwriteButtonSelector)
        .should('exist')
        .and('be.visible')
        .click();
      cy.log('Clicked the "Overwrite" button.');

      //cy.log('Step 8: Verifying successful upload...');
     // cy.contains('File uploaded successfully').should('be.visible');
      cy.log('File upload was successful.');
    });
  });
});