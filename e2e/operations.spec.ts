import { test, expect } from "@playwright/test";

test("health and readiness endpoints are machine-readable", async ({ request }) => {
  const health = await request.get("/api/v1/health");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).data.status).toBe("ok");
  const readiness = await request.get("/api/v1/readiness");
  expect(readiness.ok()).toBeTruthy();
  expect((await readiness.json()).data.status).toBe("ready");
});
