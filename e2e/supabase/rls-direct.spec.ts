import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { roleFixtures } from "./fixtures";
import { serviceClient } from "./helpers";

function userClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Local Supabase public environment is required");
  return createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function signIn(role: keyof typeof roleFixtures) {
  const client = userClient();
  const { error } = await client.auth.signInWithPassword(roleFixtures[role]);
  if (error) throw error;
  return client;
}

test("real RLS blocks employee writes and tailor deletes while admin can delete", async () => {
  const article = `E2E-RLS-${Date.now()}`;
  const employee = await signIn("employee");
  const employeeInsert = await employee.from("fabrics").insert({ article: `${article}-EMPLOYEE`, name: "RLS employee denial" });
  expect(employeeInsert.error?.code).toBe("42501");

  const tailor = await signIn("tailor");
  const tailorInsert = await tailor.from("fabrics").insert({ article, name: "RLS tailor fixture" }).select("id").single();
  expect(tailorInsert.error).toBeNull();
  expect(tailorInsert.data?.id).toBeTruthy();

  const tailorDelete = await tailor.from("fabrics").delete().eq("id", tailorInsert.data!.id).select("id");
  expect(tailorDelete.error).toBeNull();
  expect(tailorDelete.data).toEqual([]);

  const admin = await signIn("admin");
  const adminDelete = await admin.from("fabrics").delete().eq("id", tailorInsert.data!.id).select("id");
  expect(adminDelete.error).toBeNull();
  expect(adminDelete.data).toEqual([{ id: tailorInsert.data!.id }]);
});

test("deactivation revokes direct business access without waiting for JWT expiry", async () => {
  const client = await signIn("admin");
  const service = serviceClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error("Admin fixture user is missing");

  try {
    const { error: deactivateError } = await service.from("profiles").update({ is_active: false }).eq("id", authData.user.id);
    if (deactivateError) throw deactivateError;
    const fabrics = await client.from("fabrics").select("id").limit(1);
    const groups = await client.from("configuration_groups").select("id").limit(1);
    const configurations = await client.from("configurations").select("id").limit(1);
    const storage = await client.storage.from("fabric-assets").list("", { limit: 1 });
    expect(fabrics.error).toBeNull();
    expect(fabrics.data).toEqual([]);
    expect(groups.data).toEqual([]);
    expect(configurations.data).toEqual([]);
    expect(storage.data).toEqual([]);
  } finally {
    await service.from("profiles").update({ is_active: true }).eq("id", authData.user.id);
  }
});