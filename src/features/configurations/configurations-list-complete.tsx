"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Copy, Plus, Scale, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/primitives";
import { FabricMedia } from "@/components/ui/fabric-media";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { canMutateConfiguration } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

export function ConfigurationsList() {
  const user = useCurrentUser();
  const router = useRouter();
  const configurations = useWorkspace((state) => state.configurations);
  const groups = useWorkspace((state) => state.groups);
  const fabrics = useWorkspace((state) => state.fabrics);
  const save = useWorkspace((state) => state.saveConfiguration);
  const remove = useWorkspace((state) => state.deleteConfiguration);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : [current[1]!, id]);
  }

  async function duplicate(id: string) {
    const item = configurations.find((configuration) => configuration.id === id);
    if (!item || pending) return;
    setPending(id);
    setError(null);
    try {
      const now = new Date().toISOString();
      const copy = await save({
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} — копия`,
        settings: { ...item.settings },
        createdAt: now,
        updatedAt: now,
      });
      router.push(`/configurator/${encodeURIComponent(copy.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось создать копию");
      setPending(null);
    }
  }

  async function removeConfiguration(id: string, name: string) {
    if (pending || !window.confirm(`Удалить конфигурацию «${name}»?`)) return;
    setPending(id);
    setError(null);
    try {
      await remove(id);
      setSelected((current) => current.filter((item) => item !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось удалить конфигурацию");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="micro-label">Saved constructions</p>
          <h1 className="page-title mt-3">Конфигурации</h1>
          <p className="mt-3 text-sm font-medium text-[--text-secondary]">Выберите два варианта для сравнения спецификаций.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={selected.length !== 2} onClick={() => router.push(`/configurations/compare?left=${selected[0]}&right=${selected[1]}`)}>
            <Scale size={16} /> Сравнить {selected.length}/2
          </Button>
          <ButtonLink href="/configurator"><Plus size={16} /> Новая</ButtonLink>
        </div>
      </header>

      {error && <p className="field-error" role="alert">{error}</p>}

      {!configurations.length ? (
        <div className="empty-state">
          <h2 className="section-title">Конфигураций пока нет</h2>
          <ButtonLink href="/configurator" className="mt-5">Собрать первую</ButtonLink>
        </div>
      ) : (
        <div className="space-y-2">
          {configurations.map((item, index) => {
            const fabric = fabrics.find((candidate) => candidate.id === item.fabricId);
            const canMutate = canMutateConfiguration(user, item.createdBy);
            return (
              <article key={item.id} className="saved-config-row" data-selected={selected.includes(item.id)}>
                <label className="flex cursor-pointer items-center gap-3">
                  <span className="sr-only">Выбрать {item.name} для сравнения</span>
                  <input type="checkbox" className="size-[18px] rounded-[4px] accent-[--accent]" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
                  <span className="micro-label hidden md:inline">№ {String(index + 1).padStart(2, "0")}</span>
                </label>
                <FabricMedia fabric={fabric ?? { swatch: "charcoal", assets: [] }} className="!aspect-[4/5] !rounded-[10px]" />
                <div>
                  <Link href={`/configurator/${item.id}`} className="font-display text-xl text-inherit no-underline">{item.name}</Link>
                  <p className="mt-1.5 text-xs font-medium text-[--text-secondary]">{fabric?.name ?? "Ткань не выбрана"} · {formatDate(item.updatedAt)}</p>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                    {groups.slice(0, 4).map((group) => (
                      <span key={group.key} className="text-[11px] font-medium text-[--text-tertiary]">
                        <span className="uppercase tracking-[.06em]">{group.name}:</span>{" "}
                        {group.options.find((option) => option.key === item.settings[group.key])?.name ?? "—"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="saved-config-actions">
                  <Button variant="quiet" aria-label={`Дублировать ${item.name}`} disabled={Boolean(pending)} onClick={() => void duplicate(item.id)}><Copy size={16} /></Button>
                  {canMutate && (
                    <Button variant="quiet" aria-label={`Удалить ${item.name}`} disabled={Boolean(pending)} onClick={() => void removeConfiguration(item.id, item.name)}><Trash2 size={16} /></Button>
                  )}
                  <Link href={`/configurator/${item.id}`} className="icon-button" aria-label={`Открыть ${item.name}`}><ArrowUpRight size={16} /></Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
