import { Suspense } from "react";

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="muted">Загружаем сравнение…</p>}>{children}</Suspense>;
}
