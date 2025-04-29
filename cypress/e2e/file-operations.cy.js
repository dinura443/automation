// Import necessary classes and libraries
import { LoginPage } from "../../page-objects-and-services/page-objects/Login";
import { DashBoard } from "../../page-objects-and-services/page-objects/dashboard";
const login = new LoginPage();
const dashboard = new DashBoard();
const path = require('path');
const overwriteInputSelector = '#overwrite';
const overwriteButtonSelector = 'button:contains("Overwrite")';

// 1. Export the Dashboard (Instance 1)
describe("Export the Dashboard (Instance 1)", () => {
  const downloadDirectory = Cypress.env("DOWNLOAD_DIR");
  const targetDirectory = Cypress.env("BACKUP_DIR");
  const fixturesDir = Cypress.env("FIXTURES_DIR");
  const instance1Dir = Cypress.env("DASHBOARD_INSTANCE1");
  const desiredDownloadPath = "downloads";

  it("exports the file", () => {
    cy.log(`Local Login URL: ${Cypress.env("INSTANCE1_LOGIN")}`);
    cy.log(`Username: ${Cypress.env("USERNAME")}`);
    cy.log(`Password: ${Cypress.env("PASSWORD")}`);
    cy.log(`Item Name: ${Cypress.env("DASHBOARD_NAME")}`);
    cy.log("Step 1: Logging in...");
    login.visitLoginPage();
    login.enterUsername(Cypress.env("USERNAME"));
    login.enterPassword(Cypress.env("PASSWORD"));
    login.clickLoginButton();

    cy.log("Step 2: Navigating to the dashboard page...");
    dashboard.visitInstance1Dashboard();
    cy.wait(5000);

    cy.log("Step 3: Clicking on the item name...");
    const itemName = Cypress.env("DASHBOARD_NAME");
    cy.log(`Using item name: ${itemName}`);
    dashboard.findRowByItemName(itemName);
    cy.wait(2000);

    cy.log("Step 4: Triggering file download...");
    dashboard.clickShareButtonForRow(itemName);
    cy.wait(5000);

    cy.task("getLatestFile", downloadDirectory).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${downloadDirectory}`);
      }
      const fileName = path.basename(latestFilePath);
      const targetPath = path.join(targetDirectory, fileName);
      cy.log(`Step 6: Copying the downloaded file to the target directory...`);
      cy.log(`Source file: ${latestFilePath}`);
      cy.log(`Target directory: ${targetDirectory}`);

      const desiredFilePath = `${desiredDownloadPath}/${fileName}`;
      cy.log("Step 8: Moving the file to the desired directory...");
      cy.task("moveFile", {
        source: latestFilePath,
        destination: `${Cypress.env("FIXTURES_DIR")}/${desiredFilePath}`,
      }).then((result) => {
        cy.log(result);
      });

      cy.task("getLatestFile", fixturesDir).then((latestFilePath) => {
        if (!latestFilePath) {
          throw new Error(`No files found in directory: ${fixturesDir}`);
        }
        const zipPath = latestFilePath;
        const extractDir = instance1Dir;
        cy.log(`Step 2: Unzipping ZIP file: ${zipPath}`);
        cy.task("unzipFile", { zipPath, extractDir }).then((result) => {
          cy.log(result);
          cy.log("Step 3: Identifying the unzipped project directory...");
          cy.task("getLatestFile", extractDir).then((extractDir) => {
            if (!extractDir) {
              throw new Error(`No project directory found in the extracted directory: ${extractDir}`);
            }
            cy.log(`Unzipped project directory: ${extractDir}`);
          });
        });
      });
      cy.wait(1000);
    });
  });
});

// 2. Backup the Dashboard File (Instance 2)
describe("Backup the Dashboard File (Instance 2)", () => {
  const downloadDirectory = Cypress.env("DOWNLOAD_DIR");
  const targetDirectory = Cypress.env("BACKUP_DIR");

  it("backs up the file from Instance 2", () => {
    cy.log(`Hosted Login URL: ${Cypress.env("INSTANCE2_LOGIN")}`);
    cy.log(`Username: ${Cypress.env("USERNAME")}`);
    cy.log(`Password: ${Cypress.env("PASSWORD")}`);
    cy.log(`Item Name: ${Cypress.env("DASHBOARD_NAME")}`);
    cy.log("Step 1: Logging in...");

    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("USERNAME"));
    login.enterPassword(Cypress.env("PASSWORD"));
    login.clickLoginButton();
    cy.wait(2000);

    cy.log("Step 2: Navigating to the dashboard page...");
    dashboard.visitInstance2Dashboard();
    cy.wait(5000);

    cy.log("Step 3: Clicking on the item name...");
    const itemName = Cypress.env("DASHBOARD_NAME");
    cy.log(`Using item name: ${itemName}`);
    dashboard.findRowByItemName(itemName);
    cy.wait(2000);

    cy.log("Step 4: Triggering file download...");
    dashboard.clickShareButtonForRow(itemName);
    cy.wait(5000);

    cy.task("getLatestFile", downloadDirectory).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${downloadDirectory}`);
      }
      const fileName = path.basename(latestFilePath);
      const targetPath = path.join(targetDirectory, fileName);
      cy.log(`Step 6: Copying the downloaded file to the target directory...`);
      cy.log(`Source file: ${latestFilePath}`);
      cy.log(`Target directory: ${targetDirectory}`);

      cy.task("copyFile", {
        source: latestFilePath,
        destination: targetPath,
      }).then((result) => {
        cy.log(result);
      });
    });
  });
});

// 3. Log in, Navigate, Scrape, and Click on a Specific Dashboard (Instance 1)
describe("Log in, Navigate, Scrape, and Click on a Specific Dashboard (Instance 1)", () => {
  it("logs in, navigates to the dashboard, scrapes charts, and opens the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitLoginPage();
    login.enterUsername(Cypress.env("USERNAME"));
    login.enterPassword(Cypress.env("PASSWORD"));
    login.clickLoginButton();
    cy.wait(1000);

    cy.log("Navigating to the dashboard page...");
    dashboard.visitInstance1Dashboard();
    cy.wait(5000);

    const itemName = Cypress.env("DASHBOARD_NAME");
    const instanceLabel = 'instance1';
    const fileName = `${instanceLabel}_${itemName}_charts.json`;
    const fixturesFilePath = `cypress/fixtures/UIComponents/${fileName}`;

    cy.log(`Searching for item name: "${itemName}"`);
    dashboard.findRowByItemName(itemName)
      .should("exist")
      .and("be.visible")
      .then(() => {
        cy.log(`Found "${itemName}" on the dashboard.`);
        dashboard.clickItemName(itemName);
        cy.log("Waiting for dashboard charts to load...");
        cy.get('.dashboard-component', { timeout: 10000 }).should('exist');
        cy.log("Scraping charts on the specific dashboard...");
        dashboard.getDashboardCharts(itemName);
      });

    dashboard.getDashboardCharts(itemName).then((scrapedChartData) => {
      cy.task('writeJson', {
        filename: fixturesFilePath,
        data: scrapedChartData,
      });
      cy.wait(1000);
    });
  });
});

// 4. Import the Dashboard (Instance 2)
describe("Import the Dashboard (Instance 2)", () => {
  const targetUrl = Cypress.env("INSTANCE2_DASHBOARD");
  const originalDownloadPath = Cypress.env("DOWNLOAD_DIR");
  const desiredDownloadPath = "downloads";

  it("uploads a specific file, verifies, and validates the export", () => {
    cy.log("Step 1: Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("USERNAME"));
    login.enterPassword(Cypress.env("PASSWORD"));
    login.clickLoginButton();
    cy.wait(3000);

    cy.task("getLatestFile", originalDownloadPath).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${originalDownloadPath}`);
      }
      const fileName = Cypress._.last(latestFilePath.split("/"));
      const originalFilePath = latestFilePath;
      const desiredFilePath = `${desiredDownloadPath}/${fileName}`;
      cy.log(`Step 6: Downloaded file: ${fileName}`);
      cy.log(`Original file path: ${originalFilePath}`);
      cy.log(`Desired file path: ${desiredFilePath}`);

      cy.log("Step 8: Moving the file to the desired directory...");
      cy.task("moveFile", {
        source: originalFilePath,
        destination: `cypress/fixtures/${desiredFilePath}`,
      }).then((result) => {
        cy.log(result);
      });

      cy.log("Step 10: Uploading the file...");
      dashboard.uploadSpecificFile(targetUrl, desiredFilePath);
      cy.wait(5000);

      cy.get(overwriteInputSelector).type('OVERWRITE');
      cy.log('Typed "OVERWRITE" into the input field.');
      cy.get(overwriteButtonSelector)
        .should('exist')
        .and('be.visible')
        .click();
      cy.log('Clicked the "Overwrite" button.');
      cy.log('File upload completed successfully.');
    });
  });
});

// 5. Log in, Navigate, Scrape, and Click on a Specific Dashboard (Instance 2)
describe("Log in, Navigate, Scrape, and Click on a Specific Dashboard (Instance 2)", () => {
  it("logs in, navigates to the dashboard, scrapes charts, and opens the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("USERNAME"));
    login.enterPassword(Cypress.env("PASSWORD"));
    login.clickLoginButton();
    cy.wait(1000);

    cy.log("Navigating to the dashboard page...");
    dashboard.visitInstance2Dashboard();
    cy.wait(5000);

    const itemName = Cypress.env("DASHBOARD_NAME");
    const instanceLabel = 'instance2';
    const fileName = `${instanceLabel}_${itemName}_charts.json`;
    const fixturesFilePath = `cypress/fixtures/UIComponents/${fileName}`;

    cy.log(`Searching for item name: "${itemName}"`);
    dashboard.findRowByItemName(itemName)
      .should("exist")
      .and("be.visible")
      .then(() => {
        cy.log(`Found "${itemName}" on the dashboard.`);
        dashboard.clickItemName(itemName);
        cy.log("Waiting for dashboard charts to load...");
        cy.get('.dashboard-component', { timeout: 10000 }).should('exist');
        cy.log("Scraping charts on the specific dashboard...");
        dashboard.getDashboardCharts(itemName);
      });

    dashboard.getDashboardCharts(itemName).then((scrapedChartData) => {
      cy.task('writeJson', {
        filename: fixturesFilePath,
        data: scrapedChartData,
      });
      cy.wait(1000);
    });
  });
});

// 6. Export the File for Verification (Instance 2)
describe("Export the File for Verification (Instance 2)", () => {
  const originalDownloadPath = Cypress.env("DOWNLOAD_DIR");
  const fixturesDir = Cypress.env("FIXTURES_DIR");
  const itemName = Cypress.env("DASHBOARD_NAME");
  const desiredDownloadPath = "downloads";
  const instance2Dir = Cypress.env("DASHBOARD_INSTANCE2");

  it("exports a file", () => {
    cy.log(`Item Name: ${Cypress.env("DASHBOARD_NAME")}`);
    cy.log("Step 1: Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("USERNAME"));
    login.enterPassword(Cypress.env("PASSWORD"));
    login.clickLoginButton();
    cy.wait(1000);

    cy.log("Step 2: Navigating to the dashboard page...");
    dashboard.visitInstance2Dashboard();
    cy.wait(5000);

    cy.log(`Using item name: ${itemName}`);
    dashboard.findRowByItemName(itemName);
    cy.log("Step 4: Triggering file download...");
    dashboard.clickShareButtonForRow(itemName);
    cy.wait(5000);

    cy.log("Waiting for file download to complete...");
    cy.task("getLatestFile", originalDownloadPath).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${originalDownloadPath}`);
      }
      const fileName = Cypress._.last(latestFilePath.split("/"));
      const originalFilePath = latestFilePath;
      const desiredFilePath = `${desiredDownloadPath}/${fileName}`;
      cy.log(`Step 6: Downloaded file: ${fileName}`);
      cy.log(`Original file path: ${originalFilePath}`);
      cy.log(`Desired file path: ${desiredFilePath}`);

      cy.log("Step 8: Moving the file to the desired directory...");
      cy.task("moveFile", {
        source: originalFilePath,
        destination: `cypress/fixtures/${desiredFilePath}`,
      }).then((result) => {
        cy.log(result);
      });

      cy.task("getLatestFile", fixturesDir).then((latestFilePath) => {
        if (!latestFilePath) {
          throw new Error(`No files found in directory: ${fixturesDir}`);
        }
        const zipPath = latestFilePath;
        const extractDir = instance2Dir;
        cy.log(`Step 2: Unzipping ZIP file: ${zipPath}`);
        cy.task("unzipFile", { zipPath, extractDir }).then((result) => {
          cy.log(result);
          cy.log("Step 3: Identifying the unzipped project directory...");
          cy.task("getLatestFile", extractDir).then((extractDir) => {
            if (!extractDir) {
              throw new Error(`No project directory found in the extracted directory: ${extractDir}`);
            }
            cy.log(`Unzipped project directory: ${extractDir}`);
          });
        });
      });
      cy.wait(1000);
    });
  });
});