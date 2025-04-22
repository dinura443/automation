import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
import { DashBoard } from "../../page-objects-and-services/page-objects/dash-board";

const login = new LoginPage();
const dashboard = new DashBoard();

const path = require('path');


// Export from the local site


describe("File Export Test", () => {

  it("Should upload a specific file, verify overwrite, and validate the export", () => {
    cy.log(`Local Login URL: ${Cypress.env("localLoginUrl")}`);
    cy.log(`Hosted Login URL: ${Cypress.env("hostedLoginUrl")}`);
    cy.log(`Username: ${Cypress.env("username")}`);
    cy.log(`Password: ${Cypress.env("password")}`);
    cy.log(`Item Name: ${Cypress.env("itemName")}`); // Debug log

    cy.log("Step 1: Logging in...");
    login.visitLoginPage();
    login.enterUsername();
    login.enterPassword();
    login.clickLoginButton();

    cy.log("Step 2: Navigating to the dashboard page...");
    dashboard.visitDashboardPage();

    cy.log("Step 3: Clicking on the item name...");
    const itemName = Cypress.env("itemName");
    cy.log(`Using item name: ${itemName}`);
    dashboard.findRowByItemName(itemName);

    cy.log("Step 4: Triggering file download...");
    dashboard.clickShareButtonForRow(itemName);
  });
});



describe("Login, Navigate, Scrape and Click on Specific Dashboard on Instance 1", () => {
  it("Should login, navigate to dashboard, scrape charts and open the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitLoginPage(); // Adjust method if necessary
    login.enterUsername();
    login.enterPassword();
    login.clickLoginButton();
    
    cy.log("Navigating to dashboard page...");
    dashboard.visitDashboardPage(); // Adjust method if necessary

    const itemName = Cypress.env("itemName");
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
    });
  });
});




describe("Login, Navigate, Scrape and Click on Specific Dashboard on Instance 2 for Verification", () => {
  it("Should login, navigate to dashboard, scrape charts and open the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitLoginPage(); // Adjust method if necessary
    login.enterUsername();
    login.enterPassword();
    login.clickLoginButton();
    
    cy.log("Navigating to dashboard page...");
    dashboard.visitDashboardPage(); // Adjust method if necessary

    const itemName = Cypress.env("itemName");
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
        filename: fileName,  // Save as instance2_<itemName>_charts.json
        data: scrapedChartData,
      });
    });
  });
});




describe("Compare Instance 1 and Instance 2 Chart Data", () => {
  it("Should compare the chart data between instance 1 and instance 2", () => {
    const dataPath = Cypress.env("datapath");
    const itemName = Cypress.env("itemName");

    const instance1FilePath = `${dataPath}/instance1_${itemName}_charts.json`;
    const instance2FilePath = `${dataPath}/instance2_${itemName}_charts.json`;

    cy.log(`Comparing charts data for: ${itemName}`);
    cy.log(`Instance 1 file path: ${instance1FilePath}`);
    cy.log(`Instance 2 file path: ${instance2FilePath}`);

    cy.readFile(instance1FilePath).then((instance1Data) => {
      cy.readFile(instance2FilePath).then((instance2Data) => {
        
        cy.log(`Instance 1 data: ${JSON.stringify(instance1Data)}`);
        cy.log(`Instance 2 data: ${JSON.stringify(instance2Data)}`);

        expect(instance1Data.length).to.equal(instance2Data.length, "The number of charts should be the same.");

        instance1Data.forEach((chartData, index) => {
          const instance2ChartData = instance2Data[index];

          expect(chartData.title).to.equal(instance2ChartData.title, `Chart ${index + 1}: Titles should match.`);
          
          expect(chartData.id).to.equal(instance2ChartData.id, `Chart ${index + 1}: IDs should match.`);
          expect(chartData.alignment).to.equal(instance2ChartData.alignment, `Chart ${index + 1}: Alignments should match.`);
        });

        cy.log("Comparison complete: Instance 1 and Instance 2 chart data are consistent.");
      });
    });
  });
});




// Import to the hosted site
describe("File Import Test", () => {
  const targetUrl = Cypress.env("hostedDashboardUrl");
  const originalDownloadPath = Cypress.env("downloadDir");
  const desiredDownloadPath = "downloads";
  const uploadButtonSelector = 'ant-btn superset-button superset-button-primary cta css-z1d1fr';

  it("Should upload a specific file, verify, and validate the export", () => {
    cy.log("Step 1: Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername();
    login.enterPassword();
    login.clickLoginButton();

 

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


    });
  });
});


// Again export but from the hosted site for verification purposes
describe("Export file for verification", () => {


  const originalDownloadPath = Cypress.env("downloadDir");
  const desiredDownloadPath = "import_file_verify";
  const extractDir = Cypress.env("importVerifyDir");
  const itemName = Cypress.env("itemName");




  it("export a file", () => {

    cy.log(`Item Name: ${Cypress.env("itemName")}`); // Debug log

    cy.log("Step 1: Logging in...");
    login.visitHostedLoginPage();
    login.enterUsername();
    login.enterPassword();
    login.clickLoginButton();

    cy.log(`Item Name: ${Cypress.env("itemName")}`); // Debug log


    cy.log("Step 2: Navigating to the dashboard page...");
    dashboard.visitHostedDashboardPage();

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

      cy.task("getLatestFile", extractDir).then((latestFilePath) => {
        if (!latestFilePath) {
          throw new Error(`No files found in directory: ${extractDir}`);
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
});

describe("Login, Navigate, Scrape and Click on Specific Dashboard on Instance 2 for Verification", () => {
  it("Should login, navigate to dashboard, scrape charts and open the specific dashboard", () => {
    cy.log("Logging in...");
    login.visitHostedLoginPage(); // Adjust method if necessary
    login.enterUsername();
    login.enterPassword();
    login.clickLoginButton();
    
    cy.log("Navigating to dashboard page...");
    dashboard.visitHostedDashboardPage(); // Adjust method if necessary

    const itemName = Cypress.env("itemName");
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
        filename: fileName,  // Save as instance2_<itemName>_charts.json
        data: scrapedChartData,
      });
    });
  });
});



// Move & extract the downloaded files
describe("Move & extract the downloaded files", () => {
  const downloadDirectory = Cypress.env("importDir");
  const extractDir = Cypress.env("extractedFilesDir");


  

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


// Superset Export-Import Verification Using Headless
describe("Superset Export-Import Verification Using Headless", () => {
  it("should match latest exported and imported dashboard files", () => {

    // Pass environment variables to the task
    cy.task("verifySupersetFiles", {
      extractedFilesDir: Cypress.env("extractedFilesDir"),
      importVerifyDir: Cypress.env("importVerifyDir"),
    }).then((result) => {
      expect(result.success, "YAML verification passed").to.be.true;
    });
  });
});


