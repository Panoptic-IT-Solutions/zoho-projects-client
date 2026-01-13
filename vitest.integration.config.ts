import { defineConfig } from "vitest/config";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env file and set process.env
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

// Collect env vars
const envVars: Record<string, string> = {};
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        if (key) {
          envVars[key] = value;
        }
      }
    }
  }
}

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/integration/**/*.test.ts"],
    testTimeout: 30000, // 30s timeout for API calls
    hookTimeout: 30000,
    // Run integration tests sequentially to avoid rate limiting
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    setupFiles: ["src/__tests__/integration/setup.ts"],
    env: envVars,
  },
});
