import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
import { DashBoard } from "../../page-objects-and-services/page-objects/dash-board";
const path = require('path');

const login = new LoginPage();
const dashboard = new DashBoard();

describe('File Import and Verification Test', () => {
  const itemName = 'Video Game Sales'; 
  const targetUrl = 'http://localhost:8088/dashboard/list';
  const originalDownloadPath = '/home/john/Documents/Automation/cypress/downloads'; 
  const desiredDownloadPath = 'downloads'; 
  const uploadButtonSelector = 'ant-btn superset-button superset-button-primary cta css-z1d1fr';
  const overwriteInputSelector = '#overwrite';
  const overwriteButtonSelector = 'button:contains("Overwrite")';

  it('Should upload a specific file, verify overwrite, and validate the export using Python', () => {
    cy.log('Step 1: Logging in...');
    login.visitLoginPage();
    login.enterUsername('dinura');
    login.enterPassword('dinura123');
    login.clickLoginButton();

    cy.log('Step 2: Navigating to the dashboard page...');
   dashboard.visitDashboardPage();

    cy.log('Step 3: Clicking on the item name...');
    dashboard.findRowByItemName(itemName);

    cy.log('Step 4: Triggering file download...');
    dashboard.clickShareButtonForRow(itemName);

    cy.wait(5000); 
    cy.log('Waiting for file download to complete...');

    cy.task('getLatestFile', originalDownloadPath).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${originalDownloadPath}`);
      }

      const fileName = Cypress._.last(latestFilePath.split('/'));
      const originalFilePath = latestFilePath;
      const desiredFilePath = `${desiredDownloadPath}/${fileName}`;

      cy.log(`Step 6: Downloaded file: ${fileName}`);
      cy.log(`Original file path: ${originalFilePath}`);
      cy.log(`Desired file path: ${desiredFilePath}`);

      cy.log('Step 8: Moving the file to the desired directory...');
      cy.task('moveFile', {
        source: originalFilePath,
        destination: `cypress/fixtures/${desiredFilePath}`,
      }).then((result) => {
        cy.log(result);
      });

      cy.log('Step 10: Uploading the file...');
      dashboard.uploadSpecificFile(targetUrl, desiredFilePath, uploadButtonSelector);

      cy.log('Step 12: Handling overwrite confirmation...');
      cy.get(overwriteInputSelector).type('OVERWRITE');
      cy.log('Typed "OVERWRITE" into the input field.');

      cy.get(overwriteButtonSelector)
        .should('exist')
        .and('be.visible')
        .click();
      cy.log('Clicked the "Overwrite" button.');


    

      cy.log('File upload and verification were successful.');
    });
  });
}); 
describe('Verify Exported Dashboard ZIP File', () => {
  const downloadDirectory = '/home/john/Documents/Automation/cypress/fixtures/downloads';
  const extractDir = '/home/john/Documents/Automation/cypress/fixtures/extracted_files';
  const itemName = 'Video Game Sales'; 

  it('Should verify the exported ZIP file using Cypress tasks', () => {
    cy.log('Step 1: Get the latest ZIP file...');
    cy.task('getLatestFile', downloadDirectory).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${downloadDirectory}`);
      }

      const zipPath = latestFilePath;

      cy.log(`Step 2: Unzipping ZIP file: ${zipPath}`);
      cy.task('unzipFile', { zipPath, extractDir }).then((result) => {
        cy.log(result);

        cy.log('Step 3: Identifying the unzipped project directory...');
        cy.task('getLatestFile', extractDir).then((projectDir) => {
          if (!projectDir) {
            throw new Error(`No project directory found in the extracted directory: ${extractDir}`);
          }

          cy.log(`Unzipped project directory: ${projectDir}`);

          cy.log('Step 4: Verifying folder existence...');
          const folderNames = ['charts', 'dashboards', 'databases', 'datasets']; 
          cy.task('verifyFoldersExist', { baseDir: projectDir, folderNames }).then((result) => {
            if (!result.success) {
              cy.log(result.message); 
              throw new Error('Folder verification failed.');
            }

            cy.log(result.message); 
          });

        });
      });
    });
  });
});