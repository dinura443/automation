import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { VerifyExporter } from "./page-objects-and-services/page-objects/file-Verification";
import { UiVerifier } from "./page-objects-and-services/page-objects/ui-Verification";

dotenv.config();

interface ChartData {
  title: string;
  id: string;
  alignment: string;
}

export default defineConfig({
  chromeWebSecurity: false,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  env: {
    ROOT_DIR: process.env.ROOT_DIR || './temp',
    DOWNLOAD_DIR: process.env.DOWNLOAD_DIR || './temp/downloads',
    FIXTURES_DIR: process.env.FIXTURES_DIR || './temp/fixtures',
    DASHBOARD_INSTANCE1: process.env.DASHBOARD_INSTANCE1 || './temp/dashboard_instance1',
    DASHBOARD_INSTANCE2: process.env.DASHBOARD_INSTANCE2 || './temp/dashboard_instance2',
    DASHBOARD_UI: process.env.DASHBOARD_UI || './temp/UIComponents',
    BACKUP_DIR: process.env.BACKUP_DIR || './temp/backups',
    USERNAME: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD,
    DASHBOARD_NAME: process.env.DASHBOARD_NAME,
    INSTANCE1_LOGIN: process.env.INSTANCE1_LOGIN,
    INSTANCE2_LOGIN: process.env.INSTANCE2_LOGIN,
    INSTANCE1_DASHBOARD: process.env.INSTANCE1_DASHBOARD,
    INSTANCE2_DASHBOARD: process.env.INSTANCE2_DASHBOARD,
  },
  e2e: {
    video: true,
    screenshotOnRunFailure: true,
    fixturesFolder: "cypress/fixtures",
    downloadsFolder: "cypress/downloads",
    defaultCommandTimeout: 3000,
    setupNodeEvents(on, config) {
      require("@cypress/grep/src/plugin")(config);
      require("cypress-terminal-report/src/installLogsPrinter")(on);

      // Task: Compare JSON files
      on("task", {
        compareJsonFiles({ file1, file2 }) {
          try {
            const filePath1 = path.resolve(file1);
            const filePath2 = path.resolve(file2);
            const data1: ChartData[] = JSON.parse(fs.readFileSync(filePath1, "utf8"));
            const data2: ChartData[] = JSON.parse(fs.readFileSync(filePath2, "utf8"));

            if (data1.length !== data2.length) {
              return {
                success: false,
                message: `Mismatch: Instance 1 has ${data1.length} charts, while Instance 2 has ${data2.length} charts.`,
              };
            }

            let mismatchFound = false;
            const mismatches: { chartIndex: number; differences: any }[] = [];

            data1.forEach((chartData: ChartData, index) => {
              const instance2ChartData = data2[index];
              if (
                chartData.title !== instance2ChartData.title ||
                chartData.id !== instance2ChartData.id ||
                chartData.alignment !== instance2ChartData.alignment
              ) {
                mismatchFound = true;
                mismatches.push({
                  chartIndex: index + 1,
                  differences: {
                    title: chartData.title !== instance2ChartData.title
                      ? { instance1: chartData.title, instance2: instance2ChartData.title }
                      : undefined,
                    id: chartData.id !== instance2ChartData.id
                      ? { instance1: chartData.id, instance2: instance2ChartData.id }
                      : undefined,
                    alignment: chartData.alignment !== instance2ChartData.alignment
                      ? { instance1: chartData.alignment, instance2: instance2ChartData.alignment }
                      : undefined,
                  },
                });
              }
            });

            if (mismatchFound) {
              return {
                success: false,
                message: `Mismatch found in ${mismatches.length} chart(s):`,
                mismatches,
              };
            }

            return {
              success: true,
              message: "JSON files are consistent.",
            };
          } catch (error) {
            return {
              success: false,
              message: `Error comparing JSON files: ${(error as Error).message}`,
            };
          }
        },
      });

      // Task: Check if a directory is empty
      on("task", {
        isDirectoryEmpty(directoryPath: string): boolean {
          try {
            if (!fs.existsSync(directoryPath)) {
              throw new Error(`Directory does not exist: ${directoryPath}`);
            }
            const files = fs.readdirSync(directoryPath);
            return files.length === 0;
          } catch (error) {
            throw new Error(`Error checking directory: ${(error as Error).message}`);
          }
        },
      });

      // Task: Verify folders exist
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
      });

      // Task: Copy a file
      on("task", {
        copyFile({ source, destination }) {
          try {
            const destDir = path.dirname(destination);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(source, destination);
            return `File copied successfully from ${source} to ${destination}`;
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error copying file: ${errorMessage}`;
          }
        },
      });

      // Task: Get the latest file in a directory
      on("task", {
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

      // Task: Move a file
      on("task", {
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
      });

      // Task: Unzip a file
      on("task", {
        unzipFile({ zipPath, extractDir }) {
          try {
            if (!fs.existsSync(zipPath)) {
              throw new Error(`ZIP file not found: ${zipPath}`);
            }
            const AdmZip = require("adm-zip");
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractDir, true);
            return `Successfully extracted ZIP file to: ${extractDir}`;
          } catch (error) {
            const errorMessage = (error as Error).message;
            return `Error unzipping file: ${errorMessage}`;
          }
        },
      });

      // Task: Read a YAML file
      on("task", {
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
      });//k

      // Task: Verify Superset files
      on("task", {
        verifySupersetFiles({ extractedFilesDir, importVerifyDir }) {
          const verifier = new VerifyExporter(extractedFilesDir, importVerifyDir);
          const result = verifier.compare();
          return result;
        },
      });

      // Task: Log messages
      on("task", {
        log(message: string) {
          console.log(message);
          return null;
        },
      });

      // Task: Clear directory contents
      on("task", {
        clearDirectoryContents(directoryPath: string) {
          try {
            if (!fs.existsSync(directoryPath)) {
              console.log(`Directory does not exist: ${directoryPath}`);
              return `Directory does not exist: ${directoryPath}`;
            }
            const files = fs.readdirSync(directoryPath);
            files.forEach((file) => {
              const filePath = path.join(directoryPath, file);
              const stat = fs.statSync(filePath);
              if (stat.isDirectory()) {
                console.log(`Deleting subdirectory: ${filePath}`);
                fs.rmSync(filePath, { recursive: true, force: true });
              } else {
                console.log(`Deleting file: ${filePath}`);
                fs.unlinkSync(filePath);
              }
            });
            return `Cleared contents of directory: ${directoryPath}`;
          } catch (error) {
            return `Error clearing directory contents: ${(error as Error).message}`;
          }
        },
      });

      // Task: Delete old backup files
      on("task", {
        deleteOldBackupFiles(backupsDir: string) {
          try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7); // Delete files older than 7 days
            const files = fs.readdirSync(backupsDir);
            files.forEach((file) => {
              const filePath = path.join(backupsDir, file);
              const stat = fs.statSync(filePath);
              if (stat.isFile() && stat.mtime < cutoffDate) {
                console.log(`Deleting old backup file: ${filePath}`);
                fs.unlinkSync(filePath);
              }
            });
            return "Old backup files deleted successfully.";
          } catch (error) {
            return `Error deleting old backup files: ${(error as Error).message}`;
          }
        },
      });

      // Task: Verify UI contents
      on("task", {
        verifyUiContents({ dataPath, itemName }) {
          const uiVerifier = new UiVerifier(dataPath, itemName);
          const result = uiVerifier.verify();
          return result;
        },
      });

      // Task: Write JSON data to a file
      on("task", {
        writeJson({ filename, data }) {
          try {
            const dir = path.dirname(filename);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
            return `File written successfully: ${filename}`;
          } catch (error) {
            return `Error writing file: ${(error as Error).message}`;
          }
        },
      });

      // Task: Read a JSON file
      on("task", {
        readJsonFile({ filename }) {
          const filePath = path.join(__dirname, '..', '..', 'fixtures', 'data', filename);
          if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } else {
            return null;
          }
        },
      });

      return config;
    },
  },
});