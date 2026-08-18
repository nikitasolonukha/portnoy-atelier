import { ImportWorkspace } from "@/features/fabric-import/import-workspace";
import { requireActor } from "@/infrastructure/auth/actor";
import { can } from "@/lib/permissions";
import { ButtonLink } from "@/components/ui/primitives";

export default async function Page() {
  const user = await requireActor();
  if (!can(user.role, "fabric:import")) return <div className="empty-state" role="alert"><h1 className="font-display text-3xl">Недостаточно прав</h1><p className="muted mt-2 text-sm">Импорт тканей недоступен для вашей роли.</p><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;
  return <ImportWorkspace />;
}
