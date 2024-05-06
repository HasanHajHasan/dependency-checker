import { getInput, setFailed, setOutput } from "@actions/core";
import { execSync } from "child_process";
import dependencyTree from "dependency-tree";
import fs from "fs";

interface DependencyTreeOptions {
  filename: string;
  directory: string;
  tsConfig: string;
  nodeModulesConfig: {
    entry: string;
  };
  filter: (path: string) => boolean;
  nonExistent: string[];
  noTypeDefinitions: boolean;
}

async function run(): Promise<void> {
  try {
    const filePath: string = getInput('filePath', { required: true });
    const rootPath: string | undefined = process.env.GITHUB_WORKSPACE;
    if (!rootPath) {
      setFailed("GITHUB_WORKSPACE is not defined.");
      return;
    }

    const tsConfigInput: string = getInput('tsConfigPath', { required: false });
    const tsConfig: string = tsConfigInput.length !== 0 ? tsConfigInput : `${rootPath}/tsconfig.json`;

    const fullPath: string = `${rootPath}/${filePath}`;
    console.log("File path:", filePath);
    console.log("Full file path to check:", fullPath);
    
    if (!fs.existsSync(fullPath)) {
      setFailed(`The file "${filePath}" does not exist.`);
      return;
    }

    let changedFiles: string[] = [];
    let dependencyChanged: boolean = false;
    let nonExistentFiles: string[] = [];

    try {
      const commitCount: string = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();

      if (parseInt(commitCount, 10) > 1) {
        changedFiles = execSync('git diff --name-only HEAD HEAD~1', { encoding: 'utf8' })
          .split('\n')
          .filter(Boolean);

        if (changedFiles.length > 0) {
          const tree: string[] = dependencyTree.toList({
            filename: fullPath,
            directory: rootPath,
            tsConfig,
            nodeModulesConfig: {
              entry: 'module'
            },
            filter: path => path.indexOf('node_modules') === -1,
            nonExistent: nonExistentFiles,
            noTypeDefinitions: false
          } as DependencyTreeOptions);


          if (nonExistentFiles.length > 0) {
            setFailed(`The following files were referenced but could not be found: ${nonExistentFiles.join(', ')}`);
          }

          dependencyChanged = tree.some(file => changedFiles.includes(file.replace(`${rootPath}/`, '')));
        }
      } else {
        console.log("Only one commit present, skipping comparison with previous commit.");
        dependencyChanged = true;
      }
    } catch (error: any) {
      setFailed(`Error checking commit history: ${error.message}`);
      return;
    }

    setOutput('dependencyChanged', dependencyChanged);
  } catch (error: any) {
    setFailed(error.message);
  }
}

run();
