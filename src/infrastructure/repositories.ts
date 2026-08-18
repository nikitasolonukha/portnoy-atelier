import type { ConfigurationRepository } from "@/application/ports/configuration-repository";
import type { FabricRepository } from "@/application/ports/fabric-repository";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { DemoConfigurationRepository, DemoFabricRepository, loadDemoGroups } from "./demo/demo-repositories";
import { loadConfigurationGroups, SupabaseConfigurationRepository } from "./supabase/supabase-configuration-repository";
import { SupabaseFabricRepository } from "./supabase/supabase-fabric-repository";

export type Repositories = {
  fabrics: FabricRepository;
  configurations: ConfigurationRepository;
  loadGroups: typeof loadDemoGroups;
};

export async function getRepositories(): Promise<Repositories> {
  const env = getServerEnv();
  if (env.APP_MODE === "demo") return { fabrics: new DemoFabricRepository(), configurations: new DemoConfigurationRepository(), loadGroups: loadDemoGroups };
  const client = await createClient();
  return { fabrics: new SupabaseFabricRepository(client), configurations: new SupabaseConfigurationRepository(client), loadGroups: () => loadConfigurationGroups(client) };
}
