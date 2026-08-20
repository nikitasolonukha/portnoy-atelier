"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/primitives";
import { useWorkspace } from "./workspace-store";

const usesSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";

export function WorkspaceBootstrap({ children }: { children: React.ReactNode }) {
  const hydrate = useWorkspace((state) => state.hydrate);
  const status = useWorkspace((state) => state.status);
  const error = useWorkspace((state) => state.error);

  useEffect(() => {
    if (usesSupabase && status === "idle") void hydrate();
  }, [hydrate, status]);

  if (usesSupabase && (status === "idle" || status === "loading")) {
    return <div className="surface grid min-h-[320px] place-items-center p-8" role="status"><p className="muted text-sm">Загружаем рабочее пространство…</p></div>;
  }
  if (usesSupabase && status === "error") {
    return <div className="empty-state" role="alert"><h1 className="section-title">Не удалось загрузить данные</h1><p className="muted mt-2 text-sm">{error}</p><Button className="mt-5" onClick={() => void hydrate()}>Повторить</Button></div>;
  }
  return children;
}
