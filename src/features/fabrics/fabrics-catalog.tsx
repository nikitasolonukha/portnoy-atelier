"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Archive, Grid2X2, List, Plus, Search, Upload } from "lucide-react";
import { filterFabrics, sortFabrics, type CatalogSort } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/primitives";
import { FabricMedia } from "@/components/ui/fabric-media";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { can } from "@/lib/permissions";

type FilterKey = "color" | "pattern" | "status" | "sort";

export function FabricsCatalog() {
  const user = useCurrentUser();
  const fabrics = useWorkspace((state) => state.fabrics);
  const [query, setQuery] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [status, setStatus] = useState<"active" | "archived" | "all">("active");
  const [sort, setSort] = useState<CatalogSort>("name-asc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const colors = [...new Set(fabrics.map((f) => f.mainColor))].filter(Boolean);
  const patterns = [...new Set(fabrics.map((f) => f.pattern))].filter(Boolean);
  const visible = useMemo(
    () => sortFabrics(filterFabrics(fabrics, { query, color, pattern, status }), sort),
    [fabrics, query, color, pattern, status, sort],
  );

  function toggleFilter(key: FilterKey) {
    setOpenFilter((current) => (current === key ? null : key));
  }

  return (
    <div className="space-y-8">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="micro-label">Material index</p>
          <h1 className="page-title mt-3">Каталог тканей</h1>
          <p className="mt-3 text-sm text-[--ink-secondary]">{visible.length} из {fabrics.length} образцов</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can(user.role, "fabric:import") && (
            <ButtonLink href="/fabrics/import" variant="secondary"><Upload size={16} /> Импорт</ButtonLink>
          )}
          {can(user.role, "fabric:create") && (
            <ButtonLink href="/fabrics/new"><Plus size={16} /> Добавить</ButtonLink>
          )}
        </div>
      </header>

      <div className="filter-bar" ref={filterRef}>
        <label className="filter-bar__search">
          <span className="sr-only">Поиск тканей</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--text-tertiary]" size={17} aria-hidden="true" />
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Артикул, название, фабрика"
          />
        </label>
        <div className="relative flex flex-wrap items-center gap-4">
          {([
            ["color", "Цвет", color || "Все"],
            ["pattern", "Рисунок", pattern || "Все"],
            ["status", "Статус", status === "active" ? "Активные" : status === "archived" ? "Архив" : "Все"],
            ["sort", "Сортировка", sort === "name-asc" ? "А–Я" : sort === "name-desc" ? "Я–А" : "Артикул"],
          ] as const).map(([key, label, value]) => (
            <div key={key} className="relative">
              <button type="button" className="filter-chip" data-active={openFilter === key || (key !== "sort" && Boolean(value && value !== "Все" && value !== "Активные"))} onClick={() => toggleFilter(key)}>
                {label}: {value}
              </button>
              {openFilter === key && (
                <div className="filter-panel">
                  {key === "color" && colors.map((item) => (
                    <button key={item} type="button" className="block w-full py-2 text-left text-sm" onClick={() => { setColor(item); setOpenFilter(null); }}>{item}</button>
                  ))}
                  {key === "color" && <button type="button" className="block w-full py-2 text-left text-sm text-[--ink-tertiary]" onClick={() => { setColor(""); setOpenFilter(null); }}>Все</button>}
                  {key === "pattern" && patterns.map((item) => (
                    <button key={item} type="button" className="block w-full py-2 text-left text-sm" onClick={() => { setPattern(item); setOpenFilter(null); }}>{item}</button>
                  ))}
                  {key === "pattern" && <button type="button" className="block w-full py-2 text-left text-sm text-[--ink-tertiary]" onClick={() => { setPattern(""); setOpenFilter(null); }}>Все</button>}
                  {key === "status" && (["active", "archived", "all"] as const).map((item) => (
                    <button key={item} type="button" className="block w-full py-2 text-left text-sm" onClick={() => { setStatus(item); setOpenFilter(null); }}>
                      {item === "active" ? "Активные" : item === "archived" ? "Архив" : "Все"}
                    </button>
                  ))}
                  {key === "sort" && (["name-asc", "name-desc", "article-asc"] as const).map((item) => (
                    <button key={item} type="button" className="block w-full py-2 text-left text-sm" onClick={() => { setSort(item); setOpenFilter(null); }}>
                      {item === "name-asc" ? "По названию А–Я" : item === "name-desc" ? "По названию Я–А" : "По артикулу"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex overflow-hidden rounded-[10px] border border-[rgba(245,241,233,.12)]">
            <button className="icon-button rounded-none border-0 border-r border-[rgba(245,241,233,.12)]" data-active={view === "grid"} aria-label="Плиткой" onClick={() => setView("grid")}><Grid2X2 size={16} /></button>
            <button className="icon-button rounded-none border-0" data-active={view === "list"} aria-label="Списком" onClick={() => setView("list")}><List size={16} /></button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <Search className="mx-auto mb-3 text-[--ink-tertiary]" />
          <h2 className="section-title">Ничего не найдено</h2>
          <p className="muted mt-2 text-sm">Измените запрос или сбросьте фильтры.</p>
        </div>
      ) : view === "grid" ? (
        <div className="catalog-editorial">
          {visible.map((fabric) => (
            <Link
              key={fabric.id}
              href={`/fabrics/${fabric.id}`}
              className="fabric-tile group"
            >
              <FabricMedia fabric={fabric} aspect="aspect-square" />
              {!fabric.isActive && (
                <p className="mt-1.5 flex items-center gap-1 text-[10px] uppercase tracking-[.12em] text-[--ink-tertiary]">
                  <Archive size={11} /> Архив
                </p>
              )}
              <div className="fabric-tile__meta">
                <p className="fabric-tile__article">{fabric.article}</p>
                <p className="fabric-tile__name">{fabric.name}</p>
                <p className="fabric-tile__sub">
                  {fabric.manufacturer}
                  {fabric.mainColor ? ` · ${fabric.mainColor}` : ""}
                </p>
                <p className="fabric-tile__price">{formatMoney(fabric.pricePerMeter, fabric.currency)} / м</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[--border]">
          {visible.map((fabric) => (
            <Link key={fabric.id} href={`/fabrics/${fabric.id}`} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4 text-inherit no-underline sm:grid-cols-[88px_1fr_auto]">
              <FabricMedia fabric={fabric} className="!aspect-square" />
              <div className="min-w-0">
                <p className="fabric-tile__article">{fabric.article}</p>
                <p className="font-display mt-1 text-lg">{fabric.name}</p>
                <p className="fabric-tile__sub">{fabric.manufacturer} · {fabric.mainColor} · {fabric.pattern}</p>
              </div>
              <p className="text-sm font-medium">{formatMoney(fabric.pricePerMeter, fabric.currency)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
