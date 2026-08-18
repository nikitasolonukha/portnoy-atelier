import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: "diagnostic.spec.ts",
  use: { baseURL: "http://localhost:3107", trace: "on-first-retry" },
  webServer: { command: "cross-env APP_MODE=demo NEXT_PUBLIC_APP_MODE=demo PORT=3107 HOSTNAME=127.0.0.1 node scripts/start-standalone.mjs", url: "http://localhost:3107/login", reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "ipad", use: { ...devices["iPad Pro 11"] } },
  ],
});
