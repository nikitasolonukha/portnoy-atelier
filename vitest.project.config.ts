import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    exclude: ["e2e/**", "node_modules/**", ".next/**", "**/*.integration.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
      include: [
        "src/application/**/*.ts",
        "src/lib/api-response.ts",
        "src/lib/catalog.ts",
        "src/lib/configuration.ts",
        "src/lib/env.ts",
        "src/lib/import.ts",
        "src/lib/image-upload.ts",
        "src/interface/http/respond.ts",
        "src/infrastructure/supabase/fabric-mapper.ts"
      ],
      exclude: ["**/*.test.ts", "**/ports/**"],
    },
  },
});
