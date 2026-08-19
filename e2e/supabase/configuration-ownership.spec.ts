import { expect, test } from "@playwright/test";
import { authenticatedClient, goToSummary, loginAs, serviceClient } from "./helpers";
import { roleFixtures } from "./fixtures";

test("tailor sees another employee configuration as read-only", async ({ page }) => {
  const service = serviceClient();
  const admin = await authenticatedClient("admin");
  const employeeClient = await authenticatedClient("employee");
  const suffix = Date.now();
  const article = `E2E-OWNER-${suffix}`;
  const name = `Employee owned ${suffix}`;
  const { data: users, error: usersError } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) throw usersError;
  const employee = users.users.find((user) => user.email === roleFixtures.employee.email);
  if (!employee) throw new Error("Employee fixture is missing");
  const { data: fabric, error: fabricError } = await admin.from("fabrics").insert({ article, name: "Ownership fabric" }).select("id").single();
  if (fabricError) throw fabricError;
  const { data: configuration, error: configurationError } = await employeeClient.from("configurations").insert({
    name,
    created_by: employee.id,
    fabric_id: fabric.id,
    settings: { jacket: "single", lapel: "notch", buttons: "two", pockets: "flap", trousers: "classic", vest: "none" },
  }).select("id").single();
  if (configurationError) throw configurationError;

  try {
    await loginAs(page, "tailor");
    await page.goto("/configurations");
    await expect(page.getByRole("button", { name: `Удалить ${name}` })).toHaveCount(0);
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page.getByText("Только просмотр", { exact: true })).toBeVisible();
    await goToSummary(page);
    await expect(page.getByLabel("Название конфигурации")).toHaveAttribute("readonly", "");
    await expect(page.getByRole("button", { name: "Сохранено" })).toBeDisabled();
  } finally {
    await service.from("configurations").delete().eq("id", configuration.id);
    await service.from("fabrics").delete().eq("id", fabric.id);
  }
});