import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { roleFixtures } from "./fixtures";

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
