import { Suspense } from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="grid min-h-dvh place-items-center"><p className="muted">Загружаем вход…</p></main>}>{children}</Suspense>;
}
