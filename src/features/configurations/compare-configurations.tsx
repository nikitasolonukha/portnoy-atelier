"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { ButtonLink, PageHeading } from "@/components/ui/primitives";

export function CompareConfigurations() {
  const params = useSearchParams(); const groups = useWorkspace((s) => s.groups); const configs = useWorkspace((s) => s.configurations); const fabrics = useWorkspace((s) => s.fabrics); const left = configs.find((c) => c.id === params.get("left")) || configs[0]; const right = configs.find((c) => c.id === params.get("right")) || configs[1];
  if (!left || !right) return <div className="empty-state"><h1 className="font-display text-3xl">Нужно две конфигурации</h1><ButtonLink href="/configurations" className="mt-5">Вернуться к списку</ButtonLink></div>;
  const leftFabric = fabrics.find((f) => f.id === left.fabricId); const rightFabric = fabrics.find((f) => f.id === right.fabricId);
  return <div className="space-y-8"><PageHeading eyebrow="Сопоставление" title="Сравнение вариантов" actions={<ButtonLink href="/configurations" variant="secondary"><ArrowLeft size={17} /> К списку</ButtonLink>} />
    <div className="grid grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] items-stretch gap-3"><div className="surface p-4 sm:p-6"><div className={`fabric-swatch ${leftFabric?.swatch || "charcoal"} aspect-[2/1]`} /><h2 className="font-display mt-4 text-2xl">{left.name}</h2><p className="muted mt-1 text-xs">{leftFabric?.name}</p></div><div className="grid place-items-center"><ArrowRight className="text-[#7a2635]" /></div><div className="surface p-4 sm:p-6"><div className={`fabric-swatch ${rightFabric?.swatch || "charcoal"} aspect-[2/1]`} /><h2 className="font-display mt-4 text-2xl">{right.name}</h2><p className="muted mt-1 text-xs">{rightFabric?.name}</p></div></div>
    <section><div className="rule-title"><h2>Параметры</h2><span className="muted text-xs">Отличия выделены</span></div><div className="divide-y divide-[#d3ccc0]">{groups.map((group) => { const lv = group.options.find((o) => o.key === left.settings[group.key])?.name || "—"; const rv = group.options.find((o) => o.key === right.settings[group.key])?.name || "—"; const differs = lv !== rv; return <div key={group.key} className={`grid grid-cols-[1fr_110px_1fr] gap-3 py-4 text-sm ${differs ? "bg-[#f3e7e7]" : ""}`}><b className="px-3 text-right">{lv}</b><span className="muted text-center text-xs uppercase tracking-[.1em]">{group.name}</span><b className="px-3">{rv}</b></div>; })}</div></section>
  </div>;
}
