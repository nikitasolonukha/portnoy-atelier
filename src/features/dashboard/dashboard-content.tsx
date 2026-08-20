"use client";

import Link from "next/link";
import { ArrowUpRight, Settings2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/primitives";
import { FabricMedia } from "@/components/ui/fabric-media";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { formatDate } from "@/lib/utils";

export function DashboardContent() {
  const fabrics = useWorkspace((state) => state.fabrics);
  const configurations = useWorkspace((state) => state.configurations);
  const today = new Date().toDateString();
  const activeFabrics = fabrics.filter((fabric) => fabric.isActive).length;
  const updatedToday = [...fabrics, ...configurations].filter((item) => new Date(item.updatedAt).toDateString() === today).length;
  const dateLine = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero" aria-label="Обзор ателье">
        <div className="dashboard-hero__top">
          <div>
            <p className="dashboard-hero__eyebrow">{dateLine}</p>
            <h1 className="dashboard-hero__title">Рабочий стол</h1>
            <p className="dashboard-hero__lead">
              Операционный обзор ателье: материалы, сохранённые сборки и прогресс конфигураций.
            </p>
          </div>
          <ButtonLink href="/configurator" variant="secondary" className="dashboard-hero__cta">
            <Settings2 size={16} strokeWidth={1.5} /> Новая конфигурация
          </ButtonLink>
        </div>

        <div className="dashboard-hero__metrics" aria-label="Сводка">
          <div className="dashboard-hero__metric dashboard-hero__metric--primary">
            <p className="dashboard-hero__num">{String(configurations.length).padStart(2, "0")}</p>
            <p className="dashboard-hero__label">Активных конфигураций</p>
          </div>
          <div className="dashboard-hero__metric">
            <p className="dashboard-hero__num dashboard-hero__num--sm">{String(activeFabrics).padStart(2, "0")}</p>
            <p className="dashboard-hero__label">Тканей в каталоге</p>
          </div>
          <div className="dashboard-hero__metric">
            <p className="dashboard-hero__num dashboard-hero__num--sm">{String(updatedToday).padStart(2, "0")}</p>
            <p className="dashboard-hero__label">Изменений сегодня</p>
          </div>
        </div>
      </section>

      <div className="dashboard-board">
        <section className="dashboard-board__primary" aria-labelledby="recent-title">
          <div className="dashboard-section-head">
            <div>
              <p className="micro-label">Saved looks</p>
              <h2 id="recent-title" className="section-title mt-1.5">Последние конфигурации</h2>
            </div>
            <Link href="/configurations" className="text-xs font-semibold text-[--accent]">Все</Link>
          </div>
          <div className="dashboard-rows">
            {configurations.slice(0, 5).map((item, index) => {
              const fabric = fabrics.find((candidate) => candidate.id === item.fabricId);
              return (
                <Link key={item.id} href={`/configurator/${item.id}`} className="dashboard-row group">
                  <FabricMedia fabric={fabric ?? { swatch: "charcoal", assets: [] }} className="dashboard-row__swatch" />
                  <div className="min-w-0">
                    <p className="micro-label">№ {String(index + 1).padStart(2, "0")}</p>
                    <p className="dashboard-row__title">{item.name}</p>
                    <p className="dashboard-row__meta">
                      {fabric?.name ?? "Ткань не выбрана"} · {Object.keys(item.settings).length} параметров
                    </p>
                  </div>
                  <div className="dashboard-row__aside">
                    <p className="dashboard-row__date">{formatDate(item.updatedAt)}</p>
                    <ArrowUpRight size={15} className="dashboard-row__arrow" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
            {!configurations.length && (
              <p className="muted text-sm">Пока нет сохранённых сборок.</p>
            )}
          </div>
        </section>

        <section className="dashboard-board__aside" aria-labelledby="materials-title">
          <div className="dashboard-section-head">
            <div>
              <p className="micro-label">Material library</p>
              <h2 id="materials-title" className="section-title mt-1.5">Новые ткани</h2>
            </div>
            <Link href="/fabrics" className="text-xs font-semibold text-[--accent]">Каталог</Link>
          </div>
          <div className="dashboard-materials">
            {fabrics.slice(0, 6).map((fabric) => (
              <Link key={fabric.id} href={`/fabrics/${fabric.id}`} className="dashboard-material">
                <FabricMedia fabric={fabric} aspect="aspect-square" />
                <p className="fabric-tile__article mt-2">{fabric.article}</p>
                <p className="fabric-tile__name">{fabric.name}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
