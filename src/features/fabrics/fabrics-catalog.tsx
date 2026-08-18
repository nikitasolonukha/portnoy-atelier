"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ArrowUpDown, Grid2X2, List, Plus, Search, Upload } from "lucide-react";
import { filterFabrics, sortFabrics, type CatalogSort } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { ButtonLink, PageHeading } from "@/components/ui/primitives";
import { useWorkspace } from "@/features/workspace/workspace-store";

export function FabricsCatalog() {
  const fabrics = useWorkspace((state) => state.fabrics);
  const [query, setQuery] = useState(""); const [color, setColor] = useState(""); const [pattern, setPattern] = useState(""); const [status, setStatus] = useState<"active"|"archived"|"all">("active"); const [sort, setSort] = useState<CatalogSort>("name-asc"); const [view, setView] = useState<"grid"|"list">("grid");
  const colors = [...new Set(fabrics.map((f) => f.mainColor))].filter(Boolean); const patterns = [...new Set(fabrics.map((f) => f.pattern))].filter(Boolean);
  const visible = useMemo(() => sortFabrics(filterFabrics(fabrics, { query, color, pattern, status }), sort), [fabrics, query, color, pattern, status, sort]);
  return <div className="space-y-8">
    <PageHeading eyebrow="Материалы" title="Каталог тканей" description={`${visible.length} из ${fabrics.length} образцов в текущей базе.`} actions={<><ButtonLink href="/fabrics/import" variant="secondary"><Upload size={17} /> Импорт</ButtonLink><ButtonLink href="/fabrics/new"><Plus size={17} /> Добавить ткань</ButtonLink></>} />
    <section className="surface p-3" aria-label="Поиск и фильтры"><div className="grid gap-2 md:grid-cols-[minmax(240px,1fr)_160px_160px_150px_auto]">
      <label className="relative"><span className="sr-only">Поиск тканей</span><Search className="absolute left-3 top-3.5 text-[#77736b]" size={18} aria-hidden="true" /><input className="input pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Артикул, название, фабрика" /></label>
      <label><span className="sr-only">Цвет</span><select className="select" value={color} onChange={(e) => setColor(e.target.value)}><option value="">Все цвета</option>{colors.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Рисунок</span><select className="select" value={pattern} onChange={(e) => setPattern(e.target.value)}><option value="">Все рисунки</option>{patterns.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Статус</span><select className="select" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}><option value="active">Активные</option><option value="archived">Архив</option><option value="all">Все</option></select></label>
      <div className="flex"><button className="icon-button border-r-0" data-active={view === "grid"} aria-label="Показать плиткой" onClick={() => setView("grid")}><Grid2X2 size={18} /></button><button className="icon-button" aria-label="Показать списком" onClick={() => setView("list")}><List size={18} /></button></div>
    </div></section>
    <div className="flex items-center justify-between border-b border-[#d3ccc0] pb-3"><p className="text-sm"><b>{visible.length}</b> результатов</p><label className="flex items-center gap-2 text-xs font-bold"><ArrowUpDown size={15} /><span className="sr-only">Сортировка</span><select className="bg-transparent" value={sort} onChange={(e) => setSort(e.target.value as CatalogSort)}><option value="name-asc">По названию А–Я</option><option value="name-desc">По названию Я–А</option><option value="article-asc">По артикулу</option></select></label></div>
    {visible.length === 0 ? <div className="empty-state"><Search className="mx-auto mb-3 text-[#77736b]" /><h2 className="font-display text-2xl">Ничего не найдено</h2><p className="muted mt-2 text-sm">Измените запрос или сбросьте фильтры.</p></div> : view === "grid" ? <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map((fabric) => <Link key={fabric.id} href={`/fabrics/${fabric.id}`} className="group text-inherit no-underline"><div className={`fabric-swatch ${fabric.swatch} aspect-[1.18]`}><span className="absolute left-3 top-3 z-10 bg-[#f8f5ef] px-2 py-1 text-[10px] font-bold tracking-[.08em]">{fabric.article}</span>{!fabric.isActive && <span className="absolute right-3 top-3 z-10 flex items-center gap-1 bg-[#292c29] px-2 py-1 text-[10px] text-white"><Archive size={11} /> Архив</span>}</div><div className="mt-3 flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-display truncate text-xl font-normal">{fabric.name}</h2><p className="muted mt-1 truncate text-xs">{fabric.manufacturer} · {fabric.composition}</p></div><b className="text-sm">{formatMoney(fabric.pricePerMeter, fabric.currency)}</b></div></Link>)}</div> : <div className="divide-y divide-[#d3ccc0] border-y border-[#d3ccc0]">{visible.map((fabric) => <Link key={fabric.id} href={`/fabrics/${fabric.id}`} className="grid grid-cols-[58px_100px_1fr_auto] items-center gap-4 py-3 text-inherit no-underline"><div className={`fabric-swatch ${fabric.swatch} size-[58px]`} /><b className="text-xs">{fabric.article}</b><div><h2 className="text-sm font-bold">{fabric.name}</h2><p className="muted mt-1 text-xs">{fabric.manufacturer} · {fabric.mainColor} · {fabric.pattern}</p></div><b className="hidden text-sm sm:block">{formatMoney(fabric.pricePerMeter, fabric.currency)}</b></Link>)}</div>}
  </div>;
}
