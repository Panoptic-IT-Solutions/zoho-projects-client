import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/integration/**/*.test.ts"],
    testTimeout: 30000, // 30s timeout for API calls
    hookTimeout: 30000,
    // Run integration tests sequentially to avoid rate limiting
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    setupFiles: ["src/__tests__/integration/setup.ts"],
  },
});
