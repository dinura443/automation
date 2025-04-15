import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
import { DashBoard } from "../../page-objects-and-services/page-objects/dash-board";

const path = require('path');

const login = new LoginPage();
const dashboard = new DashBoard();


//export from the local site 
describe('File Export Test', () => {

  const itemName = 'dinura'; 
  

  it('Should upload a specific file, verify overwrite, and validate the export ', () => {
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

    
  });
}); 


//import to the hosted site
describe('File Import Test', () => {

  const targetUrl = 'https://analytics.qbitum.net/dashboard/list/';
  const originalDownloadPath = '/home/john/Documents/Automation/cypress/downloads'; 
  const desiredDownloadPath = 'downloads'; 
  const uploadButtonSelector = 'ant-btn superset-button superset-button-primary cta css-z1d1fr';
  const overwriteInputSelector = '#overwrite';
  const overwriteButtonSelector = 'button:contains("Overwrite")';
  

  it('Should upload a specific file, verify , and validate the export ', () => {
    cy.log('Step 1: Logging in...');
    login.visitHostedLoginPage();
    login.enterUsername('dinura');
    login.enterPassword('dinura123');
    login.clickLoginButton();

    cy.log('Step 2: Navigating to the dashboard page...');
   dashboard.visitHostedDashboardPage();


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


  });
  });
}); 

//again export but from the hosted site for verification purposes 
describe('Export file for verification', () => {


  const itemName = 'dinura'; 
  const originalDownloadPath = '/home/john/Documents/Automation/cypress/downloads'; 
  const desiredDownloadPath = 'import_file_verify'; 
  const extractDir = '/home/john/Documents/Automation/cypress/fixtures/import_file_verify';

  

  it('Should upload a specific file, verify overwrite, and validate the export ', () => {
    cy.log('Step 1: Logging in...');
    login.visitHostedLoginPage();
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

      cy.task('getLatestFile', extractDir).then((latestFilePath) => {
        if (!latestFilePath) {
          throw new Error(`No files found in directory: ${extractDir}`);
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
          });
        });
      });
  

    });
  });
}); 



describe('Move & extract the downloaded files', () => {
  const downloadDirectory = '/home/john/Documents/Automation/cypress/fixtures/downloads';
  const extractDir = '/home/john/Documents/Automation/cypress/fixtures/extracted_files';
  const itemName = 'Video Game Sales'; 


  it('extract & move files to extracted_files', () => {
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
        });
      });
    });
  });

});

describe("Superset Export-Import Verification Using Headless", () => {
  it("should match latest exported and imported dashboard files", () => {
    cy.task("verifySupersetFiles").then((result) => {
      expect(result.success, "YAML verification passed").to.be.true;
    });
  });
});

