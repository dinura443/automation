import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
import { DashBoard } from "../../page-objects-and-services/page-objects/dash-board";

const login = new LoginPage();
const dashboard = new DashBoard();

describe('File Import Test', () => {
  const itemName = 'move1';
  const targetUrl = 'https://analytics.qbitum.net/dashboard/list/';
  const originalDownloadPath = '/home/john/Documents/automation/cypress/downloads'; // Default download directory
  const desiredDownloadPath = 'downloads'; // Relative path within cypress/fixtures

  it('Should upload a specific file to the target URL', () => {
    // Step 1: Log in
    login.visitLoginPage();
    login.enterUsername('dinura');
    login.enterPassword('dinura123');
    login.clickLoginButton();

    // Step 2: Visit the dashboard page
    dashboard.visitDashboardPage();
    dashboard.findRowByItemName(itemName);
    dashboard.clickShareButtonForRow(itemName);

    // Step 3: Trigger the file download
    cy.log(`Triggering file download...`);
    // Add logic to trigger the download here...

    // Wait for the file to be downloaded
    cy.wait(5000); // Adjust the wait time based on your application's download speed

    // Step 4: Get the latest file in the download directory
    cy.task('getLatestFile', originalDownloadPath).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${originalDownloadPath}`);
      }

      // Extract the file name from the full path
      const fileName = Cypress._.last(latestFilePath.split('/')); // Get the last part of the path
      const originalFilePath = latestFilePath; // Full path of the downloaded file
      const desiredFilePath = `${desiredDownloadPath}/${fileName}`; // Construct the relative path

      cy.log(`Downloaded file: ${fileName}`);

      // Move the file to the desired directory
      cy.task('moveFile', {
        source: originalFilePath,
        destination: `cypress/fixtures/${desiredFilePath}`, // Full destination path
      }).then((result) => {
        cy.log(result); // Log the result of the file move operation
      });

      // Step 5: Upload the file
      cy.log(`Uploading file: ${desiredFilePath}`);
      dashboard.uploadSpecificFile(
        targetUrl,
        desiredFilePath, // Pass only the relative path
        'ant-btn superset-button superset-button-primary cta css-z1d1fr'
      );

      // Step 6: Verify successful upload
      cy.contains('File uploaded successfully').should('be.visible');
    });
  });
});