"use client";

import Link from "next/link";
import { ArrowRight, Box, Clock3, Settings2, SwatchBook } from "lucide-react";
import { ButtonLink, PageHeading } from "@/components/ui/primitives";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { formatDate } from "@/lib/utils";

export function DashboardContent() {
  const fabrics = useWorkspace((state) => state.fabrics);
  const configurations = useWorkspace((state) => state.configurations);
  const today = new Date().toDateString();
  const updatedToday = [...fabrics, ...configurations].filter((item) => new Date(item.updatedAt).toDateString() === today).length;

  return <div className="space-y-10">
    <PageHeading eyebrow="Рабочее пространство" title="Рабочий стол" description="Продолжите текущую сборку или найдите материал для нового костюма." actions={<ButtonLink href="/configurator"><Settings2 size={17} /> Новая конфигурация</ButtonLink>} />
    <section className="grid gap-px border border-[#d3ccc0] bg-[#d3ccc0] md:grid-cols-3" aria-label="Сводка">
      {[
        { label: "Активных тканей", value: fabrics.filter((fabric) => fabric.isActive).length, icon: SwatchBook },
        { label: "Конфигураций", value: configurations.length, icon: Box },
        { label: "Обновлено сегодня", value: updatedToday, icon: Clock3 },
      ].map(({ label, value, icon: Icon }) => <div key={label} className="bg-[#f8f5ef] px-6 py-5"><Icon size={18} className="mb-7 text-[#7a2635]" aria-hidden="true" /><strong className="font-display text-4xl font-normal">{String(value).padStart(2, "0")}</strong><p className="muted mt-1 text-xs uppercase tracking-[.12em]">{label}</p></div>)}
    </section>
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(310px,.65fr)]">
      <section aria-labelledby="recent-title"><div className="rule-title"><h2 id="recent-title">Последние конфигурации</h2><Link href="/configurations" className="text-sm font-bold text-[#7a2635]">Все конфигурации</Link></div><div className="divide-y divide-[#d3ccc0]">{configurations.slice(0, 5).map((item) => { const fabric = fabrics.find((candidate) => candidate.id === item.fabricId); return <Link key={item.id} href={`/configurator/${item.id}`} className="group grid grid-cols-[58px_1fr_auto] items-center gap-4 py-4 text-inherit no-underline"><div className={`fabric-swatch ${fabric?.swatch || "charcoal"} size-[58px]`} /><div><b className="text-sm">{item.name}</b><p className="muted mt-1 text-xs">{fabric?.name || "Ткань не выбрана"} · {Object.keys(item.settings).length} параметров</p></div><div className="flex items-center gap-3"><span className="muted hidden text-xs sm:inline">{formatDate(item.updatedAt)}</span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></div></Link>; })}</div></section>
      <section aria-labelledby="materials-title"><div className="rule-title"><h2 id="materials-title">Новые ткани</h2><Link href="/fabrics" className="text-sm font-bold text-[#7a2635]">Каталог</Link></div><div className="grid grid-cols-2 gap-3 pt-4">{fabrics.slice(0, 4).map((fabric) => <Link href={`/fabrics/${fabric.id}`} key={fabric.id} className="text-inherit no-underline"><div className={`fabric-swatch ${fabric.swatch} aspect-[4/3]`} /><b className="mt-2 block text-xs">{fabric.article}</b><span className="muted block truncate text-xs">{fabric.name}</span></Link>)}</div></section>
    </div>
  </div>;
}
