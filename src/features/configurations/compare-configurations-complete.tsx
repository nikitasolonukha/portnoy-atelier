"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonLink, PageHeading } from "@/components/ui/primitives";
import { useWorkspace } from "@/features/workspace/workspace-store";

export function CompareConfigurations() {
  const params = useSearchParams();
  const groups = useWorkspace((state) => state.groups);
  const configurations = useWorkspace((state) => state.configurations);
  const fabrics = useWorkspace((state) => state.fabrics);
  const left = configurations.find((item) => item.id === params.get("left"));
  const right = configurations.find((item) => item.id === params.get("right"));
  if (!left || !right || left.id === right.id) return <div className="empty-state" role="alert"><h1 className="font-display text-3xl">Нужно выбрать две разные конфигурации</h1><ButtonLink href="/configurations" className="mt-5">Вернуться к списку</ButtonLink></div>;
  const leftFabric = fabrics.find((fabric) => fabric.id === left.fabricId);
  const rightFabric = fabrics.find((fabric) => fabric.id === right.fabricId);
  const rows = [
    { key: "fabric", label: "Ткань", left: leftFabric ? `${leftFabric.name} (${leftFabric.article})` : "—", right: rightFabric ? `${rightFabric.name} (${rightFabric.article})` : "—" },
    ...groups.map((group) => ({ key: group.key, label: group.name, left: group.options.find((option) => option.key === left.settings[group.key])?.name ?? "—", right: group.options.find((option) => option.key === right.settings[group.key])?.name ?? "—" })),
  ];
  return <div className="space-y-8"><PageHeading eyebrow="Сопоставление" title="Сравнение вариантов" actions={<ButtonLink href="/configurations" variant="secondary"><ArrowLeft size={17} /> К списку</ButtonLink>} />
    <div className="grid grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] sm:gap-3"><div className="surface min-w-0 p-3 sm:p-6"><div className={`fabric-swatch ${leftFabric?.swatch ?? "charcoal"} aspect-[2/1]`} /><h2 className="font-display mt-4 break-words text-xl sm:text-2xl">{left.name}</h2><p className="muted mt-1 text-xs">{leftFabric?.name ?? "Ткань не выбрана"}</p></div><div className="grid place-items-center"><ArrowRight className="text-[#7a2635]" /></div><div className="surface min-w-0 p-3 sm:p-6"><div className={`fabric-swatch ${rightFabric?.swatch ?? "charcoal"} aspect-[2/1]`} /><h2 className="font-display mt-4 break-words text-xl sm:text-2xl">{right.name}</h2><p className="muted mt-1 text-xs">{rightFabric?.name ?? "Ткань не выбрана"}</p></div></div>
    <section><div className="rule-title"><h2>Параметры</h2><span className="muted text-xs">Отличия выделены</span></div><div className="divide-y divide-[#d3ccc0]">{rows.map((row) => { const differs = row.left !== row.right; return <div key={row.key} data-compare-row={row.key} className={`grid grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)] gap-2 py-4 text-xs sm:grid-cols-[minmax(0,1fr)_130px_minmax(0,1fr)] sm:gap-3 sm:text-sm ${differs ? "bg-[#f3e7e7]" : ""}`}><b className="break-words px-2 text-right sm:px-3">{row.left}</b><span className="muted text-center text-[10px] uppercase tracking-[.08em] sm:text-xs sm:tracking-[.1em]">{row.label}</span><b className="break-words px-2 sm:px-3">{row.right}</b></div>; })}</div></section>
  </div>;
}
