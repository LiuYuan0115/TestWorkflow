import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    globalSetup: ["src/setup/globalSetup.ts"],
    sequence: { concurrent: false },
    fileParallelism: false,
    retry: 0,
    testTimeout: 600_000,
    hookTimeout: 300_000,
    reporters: [
      "verbose",
      ["allure-vitest/reporter", { resultsDir: "./allure-results" }],
    ],
    setupFiles: ["allure-vitest/setup", "./src/setup/env.ts"],
    tags: [
      { name: "smoke" },
      { name: "regression" },
      { name: "p0" },
      { name: "p1" },
      { name: "p2" },
      { name: "auth" },
      { name: "chat" },
      { name: "composer" },
    ],
  },
});
