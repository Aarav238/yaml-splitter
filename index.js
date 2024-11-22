#!/usr/bin/env node

import fs from "fs-extra";
import yaml from "js-yaml";
import path from "path";
import readline from "readline";
import { Command } from "commander";
import chalk from "chalk";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to split the OAS YAML file
async function splitOASFile(inputFilePath, outputDir) {
  try {
    // Load the YAML file
    const fileContents = fs.readFileSync(inputFilePath, "utf8");
    const oasSpec = yaml.load(fileContents);

    if (!oasSpec || typeof oasSpec !== "object") {
      throw new Error("Invalid YAML structure. Please check the file.");
    }

    if (!oasSpec.paths || Object.keys(oasSpec.paths).length === 0) {
      console.log(chalk.yellow("No paths found in the OpenAPI spec."));
      return;
    }

    // Ensure output directory exists
    fs.ensureDirSync(outputDir);

    // Process each endpoint
    Object.keys(oasSpec.paths).forEach((endpoint) => {
      // Create a new spec with a single endpoint
      const singleEndpointSpec = {
        openapi: oasSpec.openapi,
        info: oasSpec.info,
        paths: {
          [endpoint]: oasSpec.paths[endpoint],
        },
        components: oasSpec.components || {},
        servers: oasSpec.servers || [],
      };

      // Format the endpoint name for the file
      const endpointFileName =
        endpoint.replace(/\//g, "_").replace(/{|}/g, "") + ".yaml";
      const outputPath = path.join(outputDir, endpointFileName);

      // Write the single endpoint YAML file
      fs.writeFileSync(outputPath, yaml.dump(singleEndpointSpec));
      console.log(chalk.green(`Created file: ${outputPath}`));
    });
  } catch (error) {
    console.error(chalk.red("Error splitting OAS file:"), error.message);
  }
}

// Function to get user input
async function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// CLI setup
const program = new Command();

program
  .name("yaml-splitter")
  .description("A tool to split and manage YAML files")
  .version("1.0.0");

// List YAML files in a directory
program
  .command("list")
  .description("List all YAML files in a directory")
  .option(
    "-d, --dir <path>",
    "Directory to search for YAML files",
    path.join(__dirname, "./input_folder")
  )
  .action((options) => {
    const { dir } = options;

    if (!fs.existsSync(dir)) {
      console.error(chalk.red(`Directory not found: ${dir}`));
      return;
    }

    const files = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));

    if (files.length === 0) {
      console.log(chalk.yellow(`No YAML files found in directory: ${dir}`));
    } else {
      console.log(chalk.green(`YAML files in ${dir}:`));
      files.forEach((file) => console.log(`- ${file}`));
    }
  });

// Split YAML file
program
  .command("split")
  .description("Split an OAS YAML file")
  .requiredOption("-f, --file <path>", "Path to the input YAML file")
  .option(
    "-o, --output-dir <path>",
    "Directory to save split files",
    path.join(__dirname, "./split_endpoints")
  )
  .action(async (options) => {
    const { file, outputDir } = options;
    if (!fs.existsSync(file)) {
      console.error(chalk.red(`File not found: ${file}`));
      return;
    }
    await splitOASFile(file, outputDir);
  });

// Interactive mode
// program
//   .command("interactive")
//   .description("Interactively select a YAML file to split")
//   .action(async () => {
//     const inputDir = path.join(__dirname, "./files");
//     const files = fs
//       .readdirSync(inputDir)
//       .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));

//     if (files.length === 0) {
//       console.log(chalk.yellow(`No YAML files found in directory: ${inputDir}`));
//       return;
//     }

//     console.log(chalk.green("Available YAML files:"));
//     files.forEach((file, index) => console.log(`${index + 1}: ${file}`));

//     const fileIndex = await getUserInput(
//       `Enter the number of the file to split (1-${files.length}): `
//     );
//     const selectedFile = files[parseInt(fileIndex, 10) - 1];

//     if (!selectedFile) {
//       console.log(chalk.red("Invalid selection. Exiting..."));
//       return;
//     }

//     const outputDir = await getUserInput(
//       "Enter the output directory (default: ./split_endpoints): "
//     );

//     const resolvedOutputDir =
//       outputDir.trim() || path.join(__dirname, "./split_endpoints");
//     const inputFilePath = path.join(inputDir, selectedFile);

//     await splitOASFile(inputFilePath, resolvedOutputDir);
//   });

program
  .command("interactive")
  .description("Interactively select a YAML file to split")
  .requiredOption(
    "-d, --dir <path>",
    "Directory to search for YAML files (e.g., './custom_folder')"
  )
  .action(async (options) => {
    const { dir } = options;

    if (!fs.existsSync(dir)) {
      console.error(chalk.red(`Directory not found: ${dir}`));
      return;
    }

    const files = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));

    if (files.length === 0) {
      console.log(chalk.yellow(`No YAML files found in directory: ${dir}`));
      return;
    }

    console.log(chalk.green("Available YAML files:"));
    files.forEach((file, index) => console.log(`${index + 1}: ${file}`));

    const fileIndex = await getUserInput(
      `Enter the number of the file to split (1-${files.length}): `
    );
    const selectedFile = files[parseInt(fileIndex, 10) - 1];

    if (!selectedFile) {
      console.log(chalk.red("Invalid selection. Exiting..."));
      return;
    }

    const outputDir = await getUserInput(
      "Enter the output directory (default: ./split_endpoints): "
    );

    const resolvedOutputDir =
      outputDir.trim() || path.join(__dirname, "./split_endpoints");
    const inputFilePath = path.join(dir, selectedFile);

    await splitOASFile(inputFilePath, resolvedOutputDir);
  });


// Merge YAML files
program
  .command("merge")
  .description("Combine split YAML files into one")
  .requiredOption("-i, --input-dir <path>", "Directory containing split YAML files")
  .requiredOption("-o, --output <path>", "Path for the combined YAML file")
  .action((options) => {
    const { inputDir, output } = options;

    if (!fs.existsSync(inputDir)) {
      console.error(chalk.red(`Input directory not found: ${inputDir}`));
      return;
    }

    const files = fs
      .readdirSync(inputDir)
      .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));

    if (files.length === 0) {
      console.log(chalk.yellow("No YAML files found to merge."));
      return;
    }

    const combined = files.reduce((acc, file) => {
      const content = yaml.load(fs.readFileSync(path.join(inputDir, file), "utf8"));
      acc.paths = { ...acc.paths, ...content.paths };
      return acc;
    }, { paths: {} });

    fs.writeFileSync(output, yaml.dump(combined));
    console.log(chalk.green(`Combined YAML saved to: ${output}`));
  });

program.parse();
