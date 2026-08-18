import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
      include: ["src/lib/**/*.ts", "src/schemas/**/*.ts"],
    },
  },
});
