import { Suspense } from "react";

export default function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="muted">Загружаем конфигуратор…</p>}>{children}</Suspense>;
}
