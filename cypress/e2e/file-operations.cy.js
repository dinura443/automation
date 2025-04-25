import { LoginPage } from "../../page-objects-and-services/page-objects/Login";
import { DashBoard } from "../../page-objects-and-services/page-objects/dashboard";

const login = new LoginPage();
const dashboard = new DashBoard();

const path = require('path');




describe("File Export Test", () => {
  it("Should upload a specific file, verify overwrite, and validate the export", () => {
    cy.log(`Local Login URL: ${Cypress.env("instance1Login")}`);
    cy.log(`Hosted Login URL: ${Cypress.env("instance2Login")}`);
    cy.log(`Username: ${Cypress.env("username")}`);
    cy.log(`Password: ${Cypress.env("password")}`);
    cy.log(`Item Name: ${Cypress.env("dashboard")}`); // Debug log

    cy.log("Step 1: Logging in...");
    login.visitLoginPage();
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
    login.clickLoginButton();

    cy.log("Step 2: Navigating to the dashboard page...");
    dashboard.visitInstance1Dashboard();
    cy.wait(5000);



    cy.log("Step 3: Clicking on the item name...");
    const itemName = Cypress.env("dashboard");
    cy.log(`Using item name: ${itemName}`);
    dashboard.findRowByItemName(itemName);

    cy.log("Step 4: Triggering file download...");
    dashboard.clickShareButtonForRow(itemName);
    cy.wait(5000);

  });
});

describe("Login, Navigate, Scrape and Click on Specific Dashboard on Instance 1", () => {
  it("Should login, navigate to dashboard, scrape charts and open the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitLoginPage(); // Adjust method if necessary
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
    login.clickLoginButton();
    cy.wait(1000);
    cy.log("Navigating to dashboard page...");
    cy.wait(10000);
    dashboard.visitInstance1Dashboard(); // Adjust method if necessary

    const itemName = Cypress.env("dashboard");
    const instanceLabel = 'instance1'; // Set the instance label for instance 1
    const fileName = `${instanceLabel}_${itemName}_charts.json`;
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
        filename: fileName,  // Save as instance1_<itemName>_charts.json
        data: scrapedChartData,
      });
      cy.wait(1000);

    });
  });
});

// Import to the hosted site
describe("File Import Test", () => {
  const targetUrl = Cypress.env("instance2Dashboard");
  const originalDownloadPath = Cypress.env("downloadDir");
  const desiredDownloadPath = "downloads";

  it("Should upload a specific file, verify, and validate the export", () => {
    cy.log("Step 1: Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
    login.clickLoginButton();
    cy.wait(1000);


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

    });
  });
});

describe("Login, Navigate, Scrape and Click on Specific Dashboard on Instance 2 for Verification", () => {
  it("Should login, navigate to dashboard, scrape charts and open the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitHostedLoginPage(); // Adjust method if necessary
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
    login.clickLoginButton();
    cy.wait(1000);
    cy.log("Navigating to dashboard page...");
    dashboard.visitInstance2Dashboard(); // Adjust method if necessary
    cy.wait(5000);
    const itemName = Cypress.env("dashboard");
    const instanceLabel = 'instance2'; // Or dynamically set with Cypress.env('instanceLabel')
    const fileName = `${instanceLabel}_${itemName}_charts.json`;
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
        filename: fileName,  
        data: scrapedChartData,
      });
      cy.wait(1000);

    });
  });
});



describe("Export file for verification", () => {
  const originalDownloadPath = Cypress.env("downloadDir");
  const extractDir = Cypress.env("instance2DashboardDir");
  const itemName = Cypress.env("dashboard");

  it("export a file", () => {
    cy.log(`Item Name: ${Cypress.env("dashboard")}`);
    cy.log("Step 1: Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
    login.clickLoginButton();
    cy.wait(1000);

    cy.log(`Item Name: ${Cypress.env("dashboard")}`);
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

      //const originalFilePath = Cypress.env("downloadDir");
      //const desiredFilePath = Cypress.env("instance2DashboardDir");

     // cy.log(`Step 6: Downloaded file: ${fileName}`);
      cy.log(`Original file path: ${originalDownloadPath}`);
      cy.log(`Desired file path: ${extractDir}`);

      cy.log("Step 8: Moving the file to the desired directory...");
      cy.task("moveFile", {
        source: originalDownloadPath,
        destination: `${extractDir}`,
      }).then((result) => {
        cy.log(result);
      });

      cy.task("getLatestFile", extractDir).then((latestFilePath) => {
        if (!latestFilePath) {
          throw new Error(`No files found in directory: ${extractDir}`);
        }

        const zipPath = latestFilePath;

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


describe("Move & extract the downloaded files", () => {
  const downloadDirectory = Cypress.env("fixturesDir");
  const extractDir = Cypress.env("instance1DashboardDir");


  

  it("extract & move files to extracted_files", () => {
    cy.log("Step 1: Get the latest ZIP file...");
    cy.task("getLatestFile", downloadDirectory).then((latestFilePath) => {
      if (!latestFilePath) {
        throw new Error(`No files found in directory: ${downloadDirectory}`);
      }

      const zipPath = latestFilePath;

      cy.log(`Step 2: Unzipping ZIP file: ${zipPath}`);
      cy.task("unzipFile", { zipPath, extractDir }).then((result) => {
        cy.log(result);

        cy.log("Step 3: Identifying the unzipped project directory...");
        cy.task("getLatestFile", extractDir).then((projectDir) => {
          if (!projectDir) {
            throw new Error(`No project directory found in the extracted directory: ${extractDir}`);
          }

          cy.log(`Unzipped project directory: ${projectDir}`);
        });
      });
    });
  });


});

