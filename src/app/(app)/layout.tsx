import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceBootstrap } from "@/features/workspace/workspace-bootstrap";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) { return <AppShell><WorkspaceBootstrap />{children}</AppShell>; }
