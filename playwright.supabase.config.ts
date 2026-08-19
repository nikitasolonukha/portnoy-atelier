import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/supabase",
  globalSetup: "./e2e/supabase/global-setup.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  use: { baseURL: "http://127.0.0.1:3108", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/start-standalone.mjs",
    env: { ...process.env, APP_MODE: "supabase", NEXT_PUBLIC_APP_MODE: "supabase", PORT: "3108", HOSTNAME: "127.0.0.1" },
    url: "http://127.0.0.1:3108/login",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "supabase-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "supabase-ipad-landscape", testMatch: /responsive-smoke\.spec\.ts/, use: { ...devices["iPad Pro 11"], viewport: { width: 1194, height: 834 } } },
    { name: "supabase-ipad-portrait", testMatch: /responsive-smoke\.spec\.ts/, use: { ...devices["iPad Pro 11"] } },
    { name: "supabase-mobile", testMatch: /responsive-smoke\.spec\.ts/, use: { ...devices["Pixel 7"] } },
  ],
});
