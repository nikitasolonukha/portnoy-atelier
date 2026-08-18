"use client";

import { createContext, useContext } from "react";
import type { CurrentUser } from "@/types/auth";

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const user = useContext(CurrentUserContext);
  if (!user) throw new Error("CurrentUserProvider is missing");
  return user;
}
