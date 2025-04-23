import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { VerifyExporter } from "./page-objects-and-services/page-objects/verify"; 
// Import the VerifyExporter class

// Load environment variables from .env
dotenv.config();



export default defineConfig({
  chromeWebSecurity: false,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  env: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    itemName: process.env.ITEM_NAME,
    downloadDir: process.env.DOWNLOAD_DIR,
    importDir: process.env.IMPORT_DIR,
    extractedFilesDir: process.env.EXTRACTED_FILES_DIR,
    importVerifyDir: process.env.IMPORT_VERIFY_DIR,
    localLoginUrl: process.env.LOCAL_LOGIN_URL,
    hostedLoginUrl: process.env.HOSTED_LOGIN_URL,
    dashboardUrl: process.env.DASHBOARD_URL,
    hostedDashboardUrl: process.env.HOSTED_DASHBOARD_URL,
    datapath: process.env.DATA_DIR
  },
  e2e: {
    
    fixturesFolder: "cypress/fixtures",
    downloadsFolder: "cypress/downloads",
    defaultCommandTimeout: 3000,
    video: false,
    setupNodeEvents(on, config) {
      require("@cypress/grep/src/plugin")(config);
      require("cypress-terminal-report/src/installLogsPrinter")(on);

      // Existing tasks
      on("task", {
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
              return { success: false, message: `The following folders are missing: ${missingFolders.join(", ")}` };
            }
            return { success: true, message: `All required folders exist in ${baseDir}` };
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error verifying folders: ${errorMessage}`;
          }
        },
        
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
        moveFile({ source, destination }) {
          try {
            const destDir = path.dirname(destination);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.renameSync(source, destination);
            return `File moved successfully from ${source} to ${destination}`;
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error moving file: ${errorMessage}`;
          }
        },
        unzipFile({ zipPath, extractDir }) {
          try {
            if (!fs.existsSync(zipPath)) {
              throw new Error(`ZIP file not found: ${zipPath}`);
            }
            const AdmZip = require("adm-zip"); // Ensure adm-zip is installed
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractDir, true);
            return `Successfully extracted ZIP file to: ${extractDir}`;
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error unzipping file: ${errorMessage}`;
          }
        },
        readYamlFile(filePath) {
          try {
            if (!fs.existsSync(filePath)) {
              throw new Error(`YAML file not found: ${filePath}`);
            }
            const yaml = require("js-yaml");
            const fileContent = fs.readFileSync(filePath, "utf8");
            return yaml.load(fileContent);
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error reading YAML file: ${errorMessage}`;
          }
        },
      });

      on("task", {
        verifySupersetFiles({ extractedFilesDir, importVerifyDir }) {
          const verifier = new VerifyExporter(extractedFilesDir, importVerifyDir); // Pass paths to the constructor
          const result = verifier.compare();
          return result; // Return the result object
        },
      });
      on('task', {
        writeJson({ filename, data }) {
          console.log(`Attempting to write JSON file: ${filename}`);
          console.log(`Data to write: ${JSON.stringify(data)}`);
          const dir = path.join(__dirname, 'data');
          if (!fs.existsSync(dir)) {
            console.log(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
          }
          const filePath = path.join(dir, filename);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          console.log(`JSON data written to ${filePath}`);
          return null;
        }
      });

      on('task', {
        readJsonFile({ filename }) {
          const filePath = path.join(__dirname, '..', '..', 'fixtures', 'data', filename); // Adjust path if using custom folder
          if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } else {
            return null; // If file doesn't exist
          }
        }
      });

      
      return config; 
      },
  },
});