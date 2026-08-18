"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button, Field } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";

const isSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    setError("");
    setPending(true);
    try {
      if (isSupabase) {
        const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
        if (authError) throw new Error("Неверный email или пароль");
      } else if (email !== "admin@portnoy.demo" || password !== "atelier2026") {
        throw new Error("Проверьте email и пароль демонстрационного доступа");
      }
      const next = search.get("next");
      router.replace(next?.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось войти. Попробуйте ещё раз");
      setPending(false);
    }
  }

  return <form action="/dashboard" className="mt-8 space-y-5" onSubmit={submit} noValidate>
    <Field label="Email" id="email" required><input className="input" id="email" name="email" type="email" required aria-required="true" autoComplete="email" defaultValue={isSupabase ? "" : "admin@portnoy.demo"} /></Field>
    <Field label="Пароль" id="password" required error={error}>
      <div className="relative"><input className="input pr-12" id="password" name="password" type={visible ? "text" : "password"} required aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? "password-error" : undefined} autoComplete="current-password" defaultValue={isSupabase ? "" : "atelier2026"} /><button type="button" className="absolute right-1 top-1 grid size-11 place-items-center" aria-label={visible ? "Скрыть пароль" : "Показать пароль"} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
    </Field>
    <Button className="w-full" type="submit" disabled={pending}><LockKeyhole size={17} aria-hidden="true" />{pending ? "Входим…" : "Войти"}</Button>
    {!isSupabase && <p className="surface p-3 text-center text-xs text-[#69665f]">Демо: admin@portnoy.demo · atelier2026</p>}
  </form>;
}