import { defineConfig } from "cypress";
import { configureAllureAdapterPlugins } from '@mmisty/cypress-allure-adapter/plugins';
import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra'; // Import fs-extra for advanced file operations

export default defineConfig({
  chromeWebSecurity: false,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  env: {
    grepOmitFiltered: true,
    grepFilterSpecs: true,
    allure: true,
    allureCleanResults: true,
    allureSkipCommands: 'wrap,screenshot,wait',
    allureResults: 'allure-results',
    allureAttachRequests: true,
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mochawesome',
    mochawesomeReporterOptions: {
      reportDir: 'cypress/report/mochawesome-report',
      reportFilename: "[datetime]-[name]-report",
      timestamp: "isoUtcDateTime",
      overwrite: false,
      html: true,
      json: true,
    },
  },

  e2e: {
    fixturesFolder: 'cypress/fixtures',
    defaultCommandTimeout: 3000,
    video: false,

    setupNodeEvents(on, config) {
      // Add Cypress Grep Plugin
      require('@cypress/grep/src/plugin')(config);

      // Add Cypress Terminal Report Plugin
      require('cypress-terminal-report/src/installLogsPrinter')(on);

      // Add Allure Adapter Plugin
      const reporter = configureAllureAdapterPlugins(on, config);

      on('before:run', (details) => {
        reporter?.writeEnvironmentInfo({
          info: {
            os: details.system.osName,
            osVersion: details.system.osVersion,
            browser: `${details.browser?.displayName} ${details.browser?.version}`,
            ...config.env,
          },
        });

        reporter?.writeCategoriesDefinitions({ categories: './allure-error-categories.json' });
      });

      // Task to get the latest file in a directory
      on('task', {
        getLatestFile(downloadDir) {
          if (!fs.existsSync(downloadDir)) {
            console.error(`Directory not found: ${downloadDir}`);
            return null;
          }

          const files = fs.readdirSync(downloadDir);
          if (files.length === 0) {
            console.error(`No files found in directory: ${downloadDir}`);
            return null;
          }

          const filePaths = files.map((file) => path.join(downloadDir, file));
          const latestFile = filePaths.reduce((latest, current) =>
            fs.statSync(current).mtime > fs.statSync(latest).mtime ? current : latest
          );

          console.log(`Found latest file: ${latestFile}`);
          return latestFile;
        },
      });

      // Task to check if a file exists
      on('task', {
        fileExists(filePath) {
          return fs.existsSync(filePath);
        },
      });

      // Task to move a file from one location to another
      on('task', {
        moveFile({ source, destination }) {
          try {
            // Ensure the destination directory exists
            const destDir = path.dirname(destination);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }

            // Move the file
            fsExtra.moveSync(source, destination, { overwrite: true });
            return `File moved successfully from ${source} to ${destination}`;
          } catch (error) {
           // return `Error moving file: ${error.message}`;
          }
        },
      });

      // Configure browser download directory
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' || browser.name === 'chromium') {
          const downloadDir = '/home/john/Documents/automation/cypress/fixtures/downloads';
          console.log(`Configuring download directory: ${downloadDir}`);
          launchOptions.preferences.default['download'] = {
            default_directory: downloadDir,
          };
          console.log(`Launch options updated:`, JSON.stringify(launchOptions, null, 2));
          return launchOptions;
        }
      });

      return config;
    },
  },
});