import { ApiProblem } from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type Actor = { id: string; role: "admin" | "tailor" | "employee" };

export async function requireActor(): Promise<Actor> {
  const env = getServerEnv();
  if (env.APP_MODE === "demo") return { id: "00000000-0000-0000-0000-000000000001", role: "admin" };
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new ApiProblem("unauthorized", "Требуется авторизация", 401);
  const { data: profile } = await client.from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active) throw new ApiProblem("account_inactive", "Учётная запись отключена", 403);
  return { id: user.id, role: profile.role as Actor["role"] };
}

export function requireRole(actor: Actor, roles: Actor["role"][]) {
  if (!roles.includes(actor.role)) throw new ApiProblem("forbidden", "Недостаточно прав", 403);
}
