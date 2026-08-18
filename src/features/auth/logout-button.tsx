"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const usesSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      if (usesSupabase) {
        const { error: signOutError } = await createClient().auth.signOut();
        if (signOutError) throw signOutError;
      }
      window.localStorage.removeItem("portnoy-workspace-v2");
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Не удалось выйти. Попробуйте ещё раз");
      setPending(false);
    }
  }

  return <div>
    <button type="button" className="nav-link w-full" disabled={pending} onClick={logout}>
      <LogOut size={18} aria-hidden="true" /><span>{pending ? "Выходим…" : "Выйти"}</span>
    </button>
    {error && <p className="mt-2 px-3 text-xs text-[#f3b9c2]" role="alert">{error}</p>}
  </div>;
}
