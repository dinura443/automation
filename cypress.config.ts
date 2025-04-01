// cypress.config.ts

import { defineConfig } from "cypress";
import { configureAllureAdapterPlugins } from '@mmisty/cypress-allure-adapter/plugins';
import XLSX from 'xlsx';
import path from 'path';
import * as fs from 'fs';

export default defineConfig({
  experimentalModifyObstructiveThirdPartyCode: true,
  projectId: "azxtwcbn",
  chromeWebSecurity: false,
  retries: {
    "runMode": 0,
    "openMode": 0
  },
  env: {
    "grepOmitFiltered": true,
    "grepFilterSpecs": true
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mochawesome',
    mochawesomeReporterOptions: {
      reportDir: 'cypress/report/mochawesome-report',
      reportFilename: "[datetime]-[name]-report",
      timestamp: "isoUtcDateTime",
      quiet: true,
      overwrite: false,
      html: true,
      json: true,
    },
  },

  e2e: {
    fixturesFolder: 'cypress/fixtures',
    defaultCommandTimeout: 3000,
    video: false,

    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'spec, mochawesome',
      mochawesomeReporterOptions: {
        reportDir: 'cypress/report/mochawesome-report',
        reportFilename: "[datetime]-[name]-report",
        timestamp: "isoUtcDateTime",
        quiet: true,
        overwrite: false,
        html: true,
        json: true,
      },
    },

    env: {
      allure: true,
      allureCleanResults: true,
      allureSkipCommands: 'wrap,screenshot,wait',
      allureResults: 'allure-results',
      allureAttachRequests: true,
    },

    setupNodeEvents(on, config) {
      require('@cypress/grep/src/plugin')(config);
      require('cypress-terminal-report/src/installLogsPrinter')(on);

      const reporter = configureAllureAdapterPlugins(on, config);

      // ===== allure context start ====
      on('before:run', details => {
        reporter?.writeEnvironmentInfo({
          info: {
            os: details.system.osName,
            osVersion: details.system.osVersion,
            browser: details.browser?.displayName + ' ' + details.browser?.version,
            ...config.env
          },
        });

        reporter?.writeCategoriesDefinitions({ categories: './allure-error-categories.json' });
      });
      // ===== allure context end ====

      // ===== Add Excel manipulation task ====
      on('task', {
        addRecordToExcel({ filePath, newRecord }) {
          try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert sheet to JSON with headers
            const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            console.log("Original Data:", data); // Log original data

            // Define the headers
            const headers = [
              'Buyer', 'PO', 'ERP Key', 'Style', 'Season', 'Product Type', 'Delivery Date', 'Destination', 'Color', 'Size', 'Quantity'
            ];

            // Create the new row from the newRecord
            const newRow = headers.map(header => newRecord[header] || '');

            console.log("New Row Data:", newRow); // Log new row data

            // Insert the new row at the 3rd position (index 2)
            if (data.length >= 2) {
              data.splice(2, 1, newRow); // Replace the 3rd row
            } else {
              // If there are fewer than 3 rows, simply append the new row
              data.push(newRow);
            }

            console.log("Updated Data:", data); // Log updated data

            // Convert JSON back to sheet
            const updatedWorksheet = XLSX.utils.aoa_to_sheet(data);
            workbook.Sheets[sheetName] = updatedWorksheet;

            // Save the file with the same name, overriding the existing file
            XLSX.writeFile(workbook, filePath);

            return filePath;
          } catch (error) {
            console.error("Error updating Excel file:", error);
            throw error;
          }
        }
      });
      // ================================

      // ===== Add Task to Get Latest Downloaded File =====
      on('task', {
        getLatestFile(downloadDir) {
          if (!fs.existsSync(downloadDir)) {
            return null;
          }

          const files = fs.readdirSync(downloadDir);
          if (files.length === 0) {
            return null;
          }

          // Sort files by modification time (most recent first)
          const filePaths = files.map((file) => path.join(downloadDir, file));
          const latestFile = filePaths.reduce((latest, current) =>
            fs.statSync(current).mtime > fs.statSync(latest).mtime ? current : latest
          );

          return latestFile;
        },
      });
      // ===============================================

      on('after:spec', (spec, results) => {
        if (results && results.stats && results.stats.tests > 0) {
          const reportFilename = `${path.basename(spec.relative, '.js')}-${results.stats.startedAt.replace(/:/g, '-')}`;
          config.reporterOptions.mochawesomeReporterOptions.reportFilename = reportFilename;
        }
      });

      return config;
    },
  },
});

