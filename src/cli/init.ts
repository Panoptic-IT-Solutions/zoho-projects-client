#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InitOptions {
  withTypes?: boolean;
  skipInstall?: boolean;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function init(options: InitOptions): Promise<void> {
  const projectRoot = process.cwd();
  const templatesDir = path.join(__dirname, "..", "..", "templates");

  console.log("Initializing Zoho Projects Client...\n");

  // 1. Install the package (unless skipped)
  if (!options.skipInstall) {
    console.log("Installing @panoptic-it-solutions/zoho-projects-client...");
    try {
      execSync("npm install @panoptic-it-solutions/zoho-projects-client", {
        cwd: projectRoot,
        stdio: "inherit",
      });
      console.log("");
    } catch (error) {
      console.error("Failed to install package. You can install manually with:");
      console.error("  npm install @panoptic-it-solutions/zoho-projects-client\n");
    }
  }

  // 2. Create .claude/commands/
  const commandsDir = path.join(projectRoot, ".claude", "commands");
  const templateCommandsDir = path.join(templatesDir, "commands");

  try {
    await fs.mkdir(commandsDir, { recursive: true });
    await fs.cp(templateCommandsDir, commandsDir, { recursive: true });
    console.log("Created .claude/commands/ with slash commands");
  } catch (error) {
    console.error("Failed to create .claude/commands/:", error);
  }

  // 3. Create CLAUDE.md (if it doesn't exist)
  const claudeMdPath = path.join(projectRoot, "CLAUDE.md");
  const templateClaudeMd = path.join(templatesDir, "CLAUDE.md");

  if (await fileExists(claudeMdPath)) {
    console.log("CLAUDE.md already exists, skipping");
  } else {
    try {
      await fs.copyFile(templateClaudeMd, claudeMdPath);
      console.log("Created CLAUDE.md");
    } catch (error) {
      console.error("Failed to create CLAUDE.md:", error);
    }
  }

  // 4. Optionally copy types
  if (options.withTypes) {
    const typesDir = path.join(projectRoot, ".ai-types");
    const templateTypesDir = path.join(templatesDir, "types");

    try {
      await fs.mkdir(typesDir, { recursive: true });
      await fs.cp(templateTypesDir, typesDir, { recursive: true });
      console.log("Copied type definitions to .ai-types/");
    } catch (error) {
      console.error("Failed to copy type definitions:", error);
    }
  }

  console.log("\nSetup complete!\n");
  console.log("Available slash commands in Claude Code:");
  console.log("  /zoho-projects  - Full API reference");
  console.log("  /zoho-auth      - OAuth 2.0 setup guide");
  console.log("  /zoho-examples  - Common usage patterns\n");
  console.log("Next steps:");
  console.log("  1. Set up your environment variables (see /zoho-auth)");
  console.log("  2. Import and use the client in your code");
  console.log("");
}

function printHelp(): void {
  console.log(`
Zoho Projects Client - AI Agent Setup

Usage:
  npx @panoptic-it-solutions/zoho-projects-client init [options]

Commands:
  init          Initialize project with Claude Code configuration

Options:
  --with-types    Copy type definitions to .ai-types/ for enhanced AI visibility
  --skip-install  Skip npm install of the package (if already installed)
  --help, -h      Show this help message

Examples:
  npx @panoptic-it-solutions/zoho-projects-client init
  npx @panoptic-it-solutions/zoho-projects-client init --with-types
  npx @panoptic-it-solutions/zoho-projects-client init --skip-install
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  if (command !== "init") {
    if (command) {
      console.error(`Unknown command: ${command}\n`);
    }
    printHelp();
    process.exit(command ? 1 : 0);
  }

  const options: InitOptions = {
    withTypes: args.includes("--with-types"),
    skipInstall: args.includes("--skip-install"),
  };

  await init(options);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
