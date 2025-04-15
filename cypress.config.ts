import { defineConfig } from "cypress";
import { configureAllureAdapterPlugins } from '@mmisty/cypress-allure-adapter/plugins';
import { VerifyExporter } from "./page-objects-and-services/page-objects/verify";
import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import AdmZip from 'adm-zip';

import yaml from 'js-yaml';


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
      require('@cypress/grep/src/plugin')(config);
      require('cypress-terminal-report/src/installLogsPrinter')(on);
      const reporter = configureAllureAdapterPlugins(on, config);

      on('task', {
        verifyFoldersExist({ baseDir, folderNames }) {
          try {
            const missingFolders = [];
            for (const folderName of folderNames) {
              const folderPath = path.join(baseDir, folderName);
              if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
                missingFolders.push(folderName);
              }
            }
            if (missingFolders.length > 0) {
              return { success: false, message: `The following folders are missing: ${missingFolders.join(', ')}` };
            }
            return { success: true, message: `All required folders exist in ${baseDir}` };
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error verifying folders: ${errorMessage}`;
          }
        },
      });

      on('task', {
        getUnzippedProjectDir(extractDir) {
          try {
            const dirContents = fs.readdirSync(extractDir);
            if (dirContents.length !== 1 || !fs.statSync(path.join(extractDir, dirContents[0])).isDirectory()) {
              throw new Error(`Expected exactly one directory in ${extractDir}`);
            }
            return path.join(extractDir, dirContents[0]);
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error getting unzipped project directory: ${errorMessage}`;
          }
        },
      });

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

      on('task', {
        fileExists(filePath) {
          return fs.existsSync(filePath);
        },
      });

      on('task', {
        moveFile({ source, destination }) {
          try {
            const destDir = path.dirname(destination);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fsExtra.moveSync(source, destination, { overwrite: true });
            return `File moved successfully from ${source} to ${destination}`;
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error moving file: ${errorMessage}`;
          }
        },
      });

      on('task', {
        unzipFile({ zipPath, extractDir }) {
          try {
            if (!fs.existsSync(zipPath)) {
              throw new Error(`ZIP file not found: ${zipPath}`);
            }
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractDir, true);
            return `Successfully extracted ZIP file to: ${extractDir}`;
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error unzipping file: ${errorMessage}`;
          }
        },
      });

      on('task', {
        readYamlFile(filePath) {
          try {
            if (!fs.existsSync(filePath)) {
              throw new Error(`YAML file not found: ${filePath}`);
            }
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return yaml.load(fileContent);
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error reading yaml file: ${errorMessage}`;
          }
        },
      });

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

      on("task", {
        verifySupersetFiles() {
          const verifier = new VerifyExporter();
          const result = verifier.compare();
          return result; // Cypress will get the result object
        }
      });

      return config;
      
    },

    
  },
});

