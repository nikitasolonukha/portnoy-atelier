"use client";

import { useEffect } from "react";
import { useWorkspace } from "./workspace-store";

export function WorkspaceBootstrap() {
  const hydrate = useWorkspace((state) => state.hydrate);
  useEffect(() => { if (process.env.NEXT_PUBLIC_APP_MODE === "supabase") void hydrate(); }, [hydrate]);
  return null;
}
