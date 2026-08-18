"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Copy, Plus, Scale, Trash2 } from "lucide-react";
import { Button, ButtonLink, PageHeading } from "@/components/ui/primitives";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { formatDate } from "@/lib/utils";

export function ConfigurationsList() {
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
    setPending(id); setError(null);
    try {
      const now = new Date().toISOString();
      const copy = await save({ ...item, id: crypto.randomUUID(), name: `${item.name} — копия`, settings: { ...item.settings }, createdAt: now, updatedAt: now });
      router.push(`/configurator/${encodeURIComponent(copy.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось создать копию"); setPending(null);
    }
  }

  async function removeConfiguration(id: string, name: string) {
    if (pending || !window.confirm(`Удалить конфигурацию «${name}»?`)) return;
    setPending(id); setError(null);
    try { await remove(id); setSelected((current) => current.filter((item) => item !== id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось удалить конфигурацию"); }
    finally { setPending(null); }
  }

  return <div className="space-y-8">
    <PageHeading eyebrow="Сохранённые варианты" title="Конфигурации" description="Выберите два варианта, чтобы увидеть различия по ткани и каждому параметру." actions={<><Button variant="secondary" disabled={selected.length !== 2} onClick={() => router.push(`/configurations/compare?left=${selected[0]}&right=${selected[1]}`)}><Scale size={17} /> Сравнить {selected.length}/2</Button><ButtonLink href="/configurator"><Plus size={17} /> Новая</ButtonLink></>} />
    {error && <p className="field-error" role="alert">{error}</p>}
    {!configurations.length ? <div className="empty-state"><h2 className="font-display text-3xl">Конфигураций пока нет</h2><ButtonLink href="/configurator" className="mt-5">Собрать первую</ButtonLink></div> : <div className="divide-y divide-[#d3ccc0] border-y border-[#d3ccc0]">{configurations.map((item) => {
      const fabric = fabrics.find((candidate) => candidate.id === item.fabricId);
      return <article key={item.id} className="grid gap-4 py-5 sm:grid-cols-[auto_78px_1fr_auto] sm:items-center"><label className="grid size-11 cursor-pointer place-items-center border border-[#c3bbae]"><span className="sr-only">Выбрать {item.name} для сравнения</span><input type="checkbox" className="size-4 accent-[#7a2635]" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /></label><div className={`fabric-swatch ${fabric?.swatch ?? "charcoal"} size-[78px]`} /><div><Link href={`/configurator/${item.id}`} className="font-display text-xl text-inherit no-underline">{item.name}</Link><p className="muted mt-1 text-xs">{fabric?.name ?? "Ткань не выбрана"} · обновлено {formatDate(item.updatedAt)}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{groups.slice(0, 3).map((group) => <span key={group.key} className="text-[11px]"><span className="muted">{group.name}:</span> {group.options.find((option) => option.key === item.settings[group.key])?.name ?? "—"}</span>)}</div></div><div className="flex items-center gap-1"><Button variant="quiet" aria-label={`Дублировать ${item.name}`} disabled={Boolean(pending)} onClick={() => void duplicate(item.id)}><Copy size={17} /></Button><Button variant="quiet" aria-label={`Удалить ${item.name}`} disabled={Boolean(pending)} onClick={() => void removeConfiguration(item.id, item.name)}><Trash2 size={17} /></Button><Link href={`/configurator/${item.id}`} className="icon-button" aria-label={`Открыть ${item.name}`}><ArrowRight size={17} /></Link></div></article>;
    })}</div>}
  </div>;
}
