import { createClient } from "@supabase/supabase-js";
import { roleFixtures } from "./fixtures";

export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase E2E fixture setup requires local URL and service role key");
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;

  const fixtureIds: string[] = [];
  for (const [role, fixture] of Object.entries(roleFixtures)) {
    let user = listed.users.find((candidate) => candidate.email === fixture.email);
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({ email: fixture.email, password: fixture.password, email_confirm: true, user_metadata: { full_name: fixture.fullName } });
      if (error || !data.user) throw error ?? new Error(`Could not create ${role} fixture`);
      user = data.user;
    } else {
      const { error } = await admin.auth.admin.updateUserById(user.id, { password: fixture.password, email_confirm: true, user_metadata: { full_name: fixture.fullName } });
      if (error) throw error;
    }
    const { error: profileError } = await admin.from("profiles").update({ full_name: fixture.fullName, role, is_active: true }).eq("id", user.id);
    if (profileError) throw profileError;
    fixtureIds.push(user.id);
  }

  const { data: assets } = await admin.from("fabric_assets").select("storage_path,fabrics!inner(article)").like("fabrics.article", "E2E-%");
  const paths = (assets ?? []).map((asset) => asset.storage_path);
  if (paths.length) await admin.storage.from("fabric-assets").remove(paths);
  await admin.from("audit_log").delete().in("actor_id", fixtureIds);
  await admin.from("fabric_imports").delete().in("created_by", fixtureIds);
  await admin.from("configurations").delete().in("created_by", fixtureIds);
  await admin.from("fabrics").delete().like("article", "E2E-%");
}
