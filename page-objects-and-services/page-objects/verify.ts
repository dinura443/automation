import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import isEqual from "lodash.isequal";

export class VerifyExporter {
  private ignoreFiles = ["metadata.yaml"];
  private extractedBase = "/home/john/Documents/Automation/cypress/fixtures/extracted_files";
  private importBase = "/home/john/Documents/Automation/cypress/fixtures/import_file_verify";

  private getLatestSubDir(baseDir: string): string | null {
    const dirs = fs.readdirSync(baseDir)
      .map(name => path.join(baseDir, name))
      .filter(fullPath => fs.statSync(fullPath).isDirectory());

    if (dirs.length === 0) return null;

    dirs.sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
    return dirs[0];
  }

  private getAllYamlFiles(dir: string, base = dir): string[] {
    const files: string[] = [];
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...this.getAllYamlFiles(fullPath, base));
      } else if (file.endsWith(".yaml") && !this.ignoreFiles.includes(path.basename(file))) {
        files.push(path.relative(base, fullPath));
      }
    });
    return files;
  }

  private loadYaml(filePath: string): any {
    const content = fs.readFileSync(filePath, "utf8");
    return yaml.load(content);
  }

  public compare(): { success: boolean; summary: any } {
    const latestExtracted = this.getLatestSubDir(this.extractedBase);
    const latestImported = this.getLatestSubDir(this.importBase);

    if (!latestExtracted || !latestImported) {
      console.error(" Could not find latest export folders.");
      return { success: false, summary: "Missing folders" };
    }

    console.log(` Comparing extracted: ${latestExtracted}`);
    console.log(` With imported:     ${latestImported}`);

    const files1 = this.getAllYamlFiles(latestExtracted);
    const files2 = this.getAllYamlFiles(latestImported);

    const missingInDir2 = files1.filter(f => !files2.includes(f));
    const extraInDir2 = files2.filter(f => !files1.includes(f));

    console.log(" Comparing folder structures...");
    if (missingInDir2.length || extraInDir2.length) {
      if (missingInDir2.length) console.warn("Missing in import folder:", missingInDir2);
      if (extraInDir2.length) console.warn("Extra in import folder:", extraInDir2);
    } else {
      console.log(" Folder structures match.");
    }

    console.log("\n Comparing YAML contents...");
    let differences = 0;

    files1.forEach(file => {
      const file1 = path.join(latestExtracted, file);
      const file2 = path.join(latestImported, file);

      if (fs.existsSync(file2)) {
        const content1 = this.loadYaml(file1);
        const content2 = this.loadYaml(file2);

        if (!isEqual(content1, content2)) {
          console.warn(` Content mismatch: ${file}`);
          differences++;
        }
      }
    });

    if (!differences && missingInDir2.length === 0 && extraInDir2.length === 0) {

      console.log("###################################################################");
      console.log(" All files match!");
      console.log("###################################################################");

    }

    return {
      success: differences === 0 && missingInDir2.length === 0 && extraInDir2.length === 0,
      summary: {
        differences,
        missingInDir2,
        extraInDir2
      }
    };
  }
}
