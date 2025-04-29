import { LoginPage } from "../../page-objects-and-services/page-objects/Login";
import { DashBoard } from "../../page-objects-and-services/page-objects/dashboard";

const login = new LoginPage();
const dashboard = new DashBoard();
const path = require('path');
const overwriteInputSelector = '#overwrite';
const overwriteButtonSelector = 'button:contains("Overwrite")';


describe("Export the Dashboard ( instance : 1 )", () => {
  
  const downloadDirectory = Cypress.env("downloadDir");
  const targetDirectory = Cypress.env("backupDir"); 
  const fixturesDir = Cypress.env("fixturesDir");
  const instance1Dir = Cypress.env("instance1DashboardDir");
  const desiredDownloadPath = "downloads";


  it("exporting the file", () => {
    cy.log(`Local Login URL: ${Cypress.env("instance1Login")}`);
    cy.log(`Hosted Login URL: ${Cypress.env("instance2Login")}`);
    cy.log(`Username: ${Cypress.env("username")}`);
    cy.log(`Password: ${Cypress.env("password")}`);
    cy.log(`Item Name: ${Cypress.env("dashboard")}`); 


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
        destination: `cypress/fixtures/${desiredFilePath}`,
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

  describe("Backup the Dashboard File ( instance : 2 )", () => {
    const downloadDirectory = Cypress.env("downloadDir");
    const targetDirectory = Cypress.env("backupDir"); // Target directory for the copied file
  
    it("backs up the file from instance 2", () => {
      cy.log(`Local Login URL: ${Cypress.env("instance2Login")}`);
      cy.log(`Username: ${Cypress.env("username")}`);
      cy.log(`Password: ${Cypress.env("password")}`);
      cy.log(`Item Name: ${Cypress.env("dashboard")}`); // Debug log
  
      cy.log("Step 1: Logging in...");
      login.visitHostedLoginPage();
      cy.wait(2000);

      login.enterUsername(Cypress.env("username"));
      login.enterPassword(Cypress.env("password"));
      login.clickLoginButton();
  
      cy.log("Step 2: Navigating to the dashboard page...");
      dashboard.visitInstance2Dashboard();
      cy.wait(5000);
  
      cy.log("Step 3: Clicking on the item name...");
      const itemName = Cypress.env("dashboard");
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

describe("Login, Navigate, Scrape and Click on Specific Dashboard (instance : 1)", () => {
  it("Should login, navigate to dashboard, scrape charts and open the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitLoginPage();
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
    login.clickLoginButton();

    cy.log("Waiting for the dashboard page to load...");

    // Intercept API calls and add Authorization Header
    cy.intercept('GET', '/api/v1/dashboard/18', (req) => {
      req.headers['Authorization'] = `Bearer ${Cypress.env('authToken')}`;
      cy.log('Intercepted request to /api/v1/dashboard/18');
      req.continue((res) => {
        cy.log(`Response status: ${res.statusCode}`);
      });
    }).as('getDashboard');

    cy.intercept('GET', '/api/v1/dashboard/_info*', (req) => {
      req.headers['Authorization'] = `Bearer ${Cypress.env('authToken')}`;
    }).as('getDashboardInfo');

    // Navigate to the dashboard
    dashboard.visitInstance1Dashboard();

    // Wait for API calls to complete
    cy.wait('@getDashboard', { timeout: 50000 }).its('response.statusCode').should('eq', 200);
    cy.wait('@getDashboardInfo', { timeout: 50000 }).its('response.statusCode').should('eq', 200);

    // Wait for the dashboard component to appear
    cy.get('.dashboard-component', { timeout: 20000 })
      .should('exist')
      .and('be.visible');

    const itemName = Cypress.env("dashboard");
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
        cy.get('.dashboard-component', { timeout: 10000 })
          .should('exist')
          .and('be.visible');

        cy.log("Scraping charts on the specific dashboard...");
        dashboard.getDashboardCharts(itemName).then((scrapedChartData) => {
          cy.task('writeJson', {
            filename: fixturesFilePath,
            data: scrapedChartData,
          });
        });
      });
  });
});

describe("Import Dashboard ( instance : 2 )", () => {
  const targetUrl = Cypress.env("instance2Dashboard");
  const originalDownloadPath = Cypress.env("downloadDir");
  const desiredDownloadPath = "downloads";



  it("Should upload a specific file, verify, and validate the export", () => {
    cy.log("Step 1: Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
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
        destination: `cypress/fixtures/${desiredDownloadPath}`,
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


describe("Login, Navigate, Scraped and Click on Specific Dashboard ( instance : 2 )", () => {
  it("Should login, navigate to dashboard, scrape charts and open the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername(Cypress.env("username"));
    login.enterPassword(Cypress.env("password"));
    login.clickLoginButton();

    cy.wait(1000);
    cy.log("Navigating to dashboard page...");
    dashboard.visitInstance2Dashboard();
    cy.wait(5000);

    const itemName = Cypress.env("dashboard");
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
        filename: fixturesFilePath, // Save the file in cypress/fixtures
        data: scrapedChartData,
      });
      cy.wait(1000);
    });
  });
});

describe("Export File for Verification ( instance : 2 )", () => {
  const originalDownloadPath = Cypress.env("downloadDir");
  const fixturesDir = Cypress.env("fixturesDir");
  const itemName = Cypress.env("dashboard");
  const desiredDownloadPath = "downloads";
  const instance2Dir = Cypress.env("instance2DashboardDir");


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


      const fileName = Cypress._.last(latestFilePath.split("/"));
      const originalFilePath = latestFilePath;
      const desiredFilePath = `${desiredDownloadPath}/${fileName}`;

      cy.log(`Step 6: Downloaded file: ${fileName}`);
      cy.log(`Original file path: ${originalFilePath}`);
      cy.log(`Desired file path: ${desiredFilePath}`);
      cy.log(`Original file path: ${originalDownloadPath}`);

      cy.log("Step 8: Moving the file to the desired directory...");
      cy.task("moveFile", {
        source: originalFilePath,
        destination: `cypress/fixtures/${desiredDownloadPath}`,
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




