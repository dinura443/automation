import * as fs from "fs";
import path from "path";
import yaml from "js-yaml";

export class VerifyExporter {
  private ignoreFiles = ["metadata.yaml"];
  private extractedBase: string;
  private importBase: string;

  constructor(extractedBase: string, importBase: string) {
    this.extractedBase = extractedBase; // e.g., Cypress.env("DASHBOARD_INSTANCE1")
    this.importBase = importBase; // e.g., Cypress.env("DASHBOARD_INSTANCE2")
  }

  /**
   * Get the latest subdirectory within a base directory.
   * @param baseDir The base directory to search.
   * @returns The path to the latest subdirectory, or null if none exist.
   */
  private getLatestSubDir(baseDir: string): string | null {
    const dirs = fs.readdirSync(baseDir)
      .map(name => path.join(baseDir, name))
      .filter(fullPath => fs.statSync(fullPath).isDirectory());

    if (dirs.length === 0) return null;

    dirs.sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
    return dirs[0];
  }

  /**
   * Recursively collect all YAML files in a directory, excluding ignored files and the "dashboards" folder.
   * @param dir The directory to search.
   * @param base The base directory for relative paths.
   * @returns An array of relative paths to YAML files.
   */
  private getAllYamlFiles(dir: string, base = dir): string[] {
    const files: string[] = [];
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      // Skip the "dashboards" directory
      if (stat.isDirectory() && path.basename(fullPath) === "dashboards") {
        console.log(`Skipping directory: ${fullPath}`);
        return;
      }

      if (stat.isDirectory()) {
        files.push(...this.getAllYamlFiles(fullPath, base));
      } else if (file.endsWith(".yaml") && !this.ignoreFiles.includes(path.basename(file))) {
        files.push(path.relative(base, fullPath));
      }
    });
    return files;
  }

  /**
   * Load and parse a YAML file.
   * @param filePath The path to the YAML file.
   * @returns The parsed YAML content.
   */
  private loadYaml(filePath: string): any {
    const content = fs.readFileSync(filePath, "utf8");
    return yaml.load(content);
  }

  /**
   * Recursively find differences between two objects.
   * @param obj1 The first object to compare.
   * @param obj2 The second object to compare.
   * @param path The current path in the object hierarchy.
   * @returns An array of difference messages.
   */
  private findDifferences(obj1: any, obj2: any, currentPath: string = ""): string[] {
    const differences: string[] = [];

    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    allKeys.forEach(key => {
      // Skip comparison for specific keys
      if (key === "sqlalchemy_uri") return;

      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (!(key in obj1)) {
        differences.push(`Missing in exported: ${newPath}`);
      } else if (!(key in obj2)) {
        differences.push(`Missing in imported: ${newPath}`);
      } else if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        // Recursively compare nested objects
        differences.push(...this.findDifferences(obj1[key], obj2[key], newPath));
      } else if (obj1[key] !== obj2[key]) {
        differences.push(`Mismatch at ${newPath}: Exported=${obj1[key]}, Imported=${obj2[key]}`);
      }
    });

    return differences;
  }

  /**
   * Compare the contents of two directories containing YAML files.
   * @returns An object indicating success and a summary of differences.
   */
  public compare(): { success: boolean; summary: any } {
    const latestExtracted = this.getLatestSubDir(this.extractedBase);
    const latestImported = this.getLatestSubDir(this.importBase);

    if (!latestExtracted || !latestImported) {
      console.error("Could not find latest export folders.");
      return { success: false, summary: "Missing folders" };
    }

    console.log(`Comparing extracted: ${latestExtracted}`);
    console.log(`With imported:     ${latestImported}`);

    const files1 = this.getAllYamlFiles(latestExtracted);
    const files2 = this.getAllYamlFiles(latestImported);

    // Filter out files in the "dashboards" directory
    const filterDashboards = (files: string[]) =>
      files.filter(file => !file.startsWith("dashboards/"));

    const filteredFiles1 = filterDashboards(files1);
    const filteredFiles2 = filterDashboards(files2);

    const missingInDir2 = filteredFiles1.filter(f => !filteredFiles2.includes(f));
    const extraInDir2 = filteredFiles2.filter(f => !filteredFiles1.includes(f));

    console.log("Comparing folder structures...");
    if (missingInDir2.length || extraInDir2.length) {
      if (missingInDir2.length) console.warn("Missing in import folder:", missingInDir2);
      if (extraInDir2.length) console.warn("Extra in import folder:", extraInDir2);
    } else {
      console.log("Folder structures match.");
    }

    console.log("\nComparing YAML contents...");
    let differences = 0;

    filteredFiles1.forEach(file => {
      const file1 = path.join(latestExtracted, file);
      const file2 = path.join(latestImported, file);

      if (fs.existsSync(file2)) {
        const content1 = this.loadYaml(file1);
        const content2 = this.loadYaml(file2);

        const diff = this.findDifferences(content1, content2);
        if (diff.length > 0) {
          console.warn(`Content mismatch: ${file}`);
          differences++;
          diff.forEach(d => console.warn(d));
        }
      }
    });

    if (!differences && missingInDir2.length === 0 && extraInDir2.length === 0) {
      console.log("All files match!");
    }

    return {
      success: differences === 0 && missingInDir2.length === 0 && extraInDir2.length === 0,
      summary: {
        differences,
        missingInDir2,
        extraInDir2,
      },
    };
  }
}