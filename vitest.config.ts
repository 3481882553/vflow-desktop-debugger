import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["tests/setup/vitest.setup.ts"],
    include: ["tests/renderer/**/*.test.ts", "tests/renderer/**/*.test.tsx", "tests/main/**/*.test.ts"],
    environmentMatchGlobs: [["tests/main/**", "node"]],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/main/**/*.ts", "src/renderer/**/*.ts", "src/renderer/**/*.tsx"],
      exclude: ["**/*.d.ts", "src/renderer/data/**"],
      thresholds: {
        lines: 65,
        branches: 55,
        functions: 65,
        statements: 65
      }
    }
  }
});
