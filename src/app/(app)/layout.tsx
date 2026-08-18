import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceBootstrap } from "@/features/workspace/workspace-bootstrap";
import { requireActor } from "@/infrastructure/auth/actor";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireActor();
  return <AppShell user={user}><WorkspaceBootstrap />{children}</AppShell>;
}
