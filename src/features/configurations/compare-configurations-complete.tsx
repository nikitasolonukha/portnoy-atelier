"use client";

import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/primitives";
import { FabricMedia } from "@/components/ui/fabric-media";
import { useWorkspace } from "@/features/workspace/workspace-store";

export function CompareConfigurations() {
  const params = useSearchParams();
  const groups = useWorkspace((state) => state.groups);
  const configurations = useWorkspace((state) => state.configurations);
  const fabrics = useWorkspace((state) => state.fabrics);
  const left = configurations.find((item) => item.id === params.get("left"));
  const right = configurations.find((item) => item.id === params.get("right"));

  if (!left || !right || left.id === right.id) {
    return (
      <div className="empty-state" role="alert">
        <h1 className="section-title">Нужно выбрать две разные конфигурации</h1>
        <ButtonLink href="/configurations" className="mt-5">Вернуться к списку</ButtonLink>
      </div>
    );
  }

  const leftFabric = fabrics.find((fabric) => fabric.id === left.fabricId);
  const rightFabric = fabrics.find((fabric) => fabric.id === right.fabricId);
  const rows = [
    { key: "fabric", label: "Ткань", left: leftFabric ? `${leftFabric.name} (${leftFabric.article})` : "—", right: rightFabric ? `${rightFabric.name} (${rightFabric.article})` : "—" },
    ...groups.map((group) => ({
      key: group.key,
      label: group.name,
      left: group.options.find((option) => option.key === left.settings[group.key])?.name ?? "—",
      right: group.options.find((option) => option.key === right.settings[group.key])?.name ?? "—",
    })),
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="micro-label">Specification compare</p>
        <h1 className="page-title mt-3">Сравнение</h1>
        <div className="mt-4">
          <ButtonLink href="/configurations" variant="secondary">К списку</ButtonLink>
        </div>
      </header>

      <div className="compare-variants">
        <div className="compare-variant compare-variant--a">
          <p className="micro-label mb-3">Variant A</p>
          <FabricMedia fabric={leftFabric ?? { swatch: "charcoal", assets: [] }} aspect="aspect-[16/10]" className="!rounded-[14px]" />
          <h2 className="font-display mt-4 text-xl">{left.name}</h2>
        </div>
        <div className="compare-variant compare-variant--b">
          <p className="micro-label mb-3">Variant B</p>
          <FabricMedia fabric={rightFabric ?? { swatch: "charcoal", assets: [] }} aspect="aspect-[16/10]" className="!rounded-[14px]" />
          <h2 className="font-display mt-4 text-xl">{right.name}</h2>
        </div>
      </div>

      <section aria-label="Параметры" className="compare-sheet">
        <div className="px-4 pt-4 pb-3">
          <p className="micro-label">Parameters</p>
        </div>
        <div>
          {rows.map((row) => {
            const differs = row.left !== row.right;
            return (
              <div
                key={row.key}
                data-compare-row={row.key}
                data-differs={differs}
                className={`compare-sheet__row grid grid-cols-[minmax(0,1fr)_100px_minmax(0,1fr)] gap-3 px-4 py-4 text-sm md:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)] ${row.key !== rows.at(-1)?.key ? "border-b border-[--border]" : ""}`}
              >
                <span className={`compare-sheet__value text-right font-medium ${differs ? "" : "text-[--text-secondary]"}`}>{row.left}</span>
                <span className="micro-label text-center">{row.label}</span>
                <span className={`compare-sheet__value font-medium ${differs ? "" : "text-[--text-secondary]"}`}>{row.right}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
