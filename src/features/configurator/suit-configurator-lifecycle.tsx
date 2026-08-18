"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Save } from "lucide-react";
import { Button, PageHeading } from "@/components/ui/primitives";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { createConfiguratorDraft, isConfiguratorDirty, markConfiguratorSaved, resetConfiguratorDraft, withConfiguratorEdit } from "./configurator-state";

export function SuitConfigurator({ configurationId }: { configurationId?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const requestedId = configurationId ?? params.get("id") ?? undefined;
  const groups = useWorkspace((state) => state.groups);
  const allFabrics = useWorkspace((state) => state.fabrics);
  const configurations = useWorkspace((state) => state.configurations);
  const saveConfiguration = useWorkspace((state) => state.saveConfiguration);
  const fabrics = useMemo(() => allFabrics.filter((fabric) => fabric.isActive), [allFabrics]);
  const defaults = useMemo(() => Object.fromEntries(groups.map((group) => [group.key, group.options.find((option) => option.isActive)?.key ?? ""])), [groups]);
  const source = requestedId ? configurations.find((item) => item.id === requestedId) ?? null : null;
  const [draft, setDraft] = useState(() => createConfiguratorDraft(source, params.get("fabric") ?? fabrics[0]?.id ?? "", defaults));
  const [step, setStep] = useState(0);
  const selectedFabric = fabrics.find((fabric) => fabric.id === draft.fabricId);
  const group = step === 0 ? undefined : groups[step - 1];
  const dirty = isConfiguratorDirty(draft);
  const progress = Math.round(((step + 1) / (groups.length + 1)) * 100);

  useEffect(() => {
    if (requestedId && source && draft.id !== requestedId) setDraft(createConfiguratorDraft(source, "", defaults));
  }, [defaults, draft.id, requestedId, source]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty || draft.status === "saving") event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, draft.status]);

  if (requestedId && !source && draft.id !== requestedId) {
    return <div className="empty-state" role="alert"><h1 className="font-display text-3xl">Конфигурация не найдена</h1><p className="muted mt-2 text-sm">Проверьте адрес или вернитесь к списку.</p><Link className="button button-primary mt-5" href="/configurations">К конфигурациям</Link></div>;
  }

  function edit(patch: Parameters<typeof withConfiguratorEdit>[1]) {
    setDraft((current) => withConfiguratorEdit(current, patch));
  }

  async function save() {
    if (draft.status === "saving") return;
    if (!draft.name.trim()) { setDraft((current) => ({ ...current, status: "error", error: "Укажите название конфигурации" })); return; }
    if (!draft.fabricId) { setDraft((current) => ({ ...current, status: "error", error: "Выберите ткань" })); return; }
    if (groups.some((item) => !draft.settings[item.key])) { setDraft((current) => ({ ...current, status: "error", error: "Выберите значение для каждой группы" })); return; }
    setDraft((current) => ({ ...current, status: "saving", error: null }));
    try {
      const now = new Date().toISOString();
      const saved = await saveConfiguration({
        id: draft.id ?? crypto.randomUUID(), name: draft.name.trim(), fabricId: draft.fabricId,
        settings: draft.settings, createdAt: draft.createdAt ?? now, updatedAt: now,
      });
      setDraft((current) => markConfiguratorSaved(current, saved));
      router.replace(`/configurator/${encodeURIComponent(saved.id)}`);
    } catch (cause) {
      setDraft((current) => ({ ...current, status: "error", error: cause instanceof Error ? cause.message : "Не удалось сохранить конфигурацию" }));
    }
  }

  const summary = groups.map((item) => ({ group: item.name, option: item.options.find((option) => option.key === draft.settings[item.key])?.name ?? "—" }));
  const statusText = draft.status === "saving" ? "Сохранение…" : draft.status === "error" ? "Ошибка сохранения" : dirty || !draft.id ? "Есть несохранённые изменения" : "Все изменения сохранены";

  return <div className="space-y-7">
    <PageHeading eyebrow="Сборка костюма" title="Конфигуратор" description="Параметры загружаются из групп и опций. 3D-просмотр исключён из этой версии по вашему указанию." actions={<Link href="/configurations" className="button button-secondary" onClick={(event) => { if (dirty && !window.confirm("Изменения не сохранены. Выйти без сохранения?")) event.preventDefault(); }}>К конфигурациям</Link>} />
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="h-1 min-w-[220px] flex-1 bg-[#ddd5ca]" aria-label={`Прогресс ${progress}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full bg-[#7a2635] transition-[width]" style={{ width: `${progress}%` }} /></div><p className={`text-xs ${draft.status === "error" ? "text-[#8b2435]" : "muted"}`} role="status">{statusText}</p></div>
    <div className="grid gap-7 xl:grid-cols-[minmax(0,.9fr)_minmax(360px,1.1fr)]">
      <section className="surface overflow-hidden"><div className={`fabric-swatch ${selectedFabric?.swatch ?? "charcoal"} relative min-h-[430px] sm:min-h-[560px]`}>
        <div className="absolute inset-0 z-10 flex items-center justify-center"><div className="relative h-[72%] w-[54%] max-w-[330px] min-w-[220px]" aria-label="Плоский эскиз костюма"><div className="absolute left-[9%] top-0 h-[70%] w-[82%] bg-[#e9e3d8] shadow-2xl [clip-path:polygon(22%_0,43%_8%,50%_32%,57%_8%,78%_0,100%_16%,84%_38%,81%_100%,19%_100%,16%_38%,0_16%)]" /><div className="absolute left-[30%] top-[11%] h-[41%] w-[40%] border-x-[24px] border-transparent border-t-[92px] border-t-[#cfc6b7]" /><div className="absolute bottom-0 left-[22%] h-[39%] w-[25%] bg-[#ddd6ca] [clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]" /><div className="absolute bottom-0 right-[22%] h-[39%] w-[25%] bg-[#ddd6ca] [clip-path:polygon(0_0,100%_0,100%_100%,18%_100%)]" /></div></div>
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-[#f8f5ef]/95 p-4"><p className="eyebrow">Материал</p><b className="mt-1 block text-sm">{selectedFabric?.name ?? "Ткань не выбрана"}</b><span className="muted text-xs">{selectedFabric ? `${selectedFabric.article} · ${selectedFabric.composition}` : "Выберите материал на первом шаге"}</span></div>
      </div></section>
      <section className="surface flex min-h-[560px] flex-col p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Шаг {step + 1} из {groups.length + 1}</p><h2 className="font-display mt-2 text-3xl font-normal">{step === 0 ? "Ткань" : group?.name}</h2></div><Button variant="quiet" onClick={() => setDraft((current) => resetConfiguratorDraft(current))} disabled={!dirty || draft.status === "saving"}><RotateCcw size={16} /> Сбросить</Button></div>
        <div className="mt-7 flex-1">{step === 0 ? <div className="grid gap-3 sm:grid-cols-2">{fabrics.map((fabric) => <button key={fabric.id} type="button" className={`grid grid-cols-[68px_1fr_auto] items-center gap-3 border p-2 text-left ${fabric.id === draft.fabricId ? "border-[#7a2635] bg-[#f7efee]" : "border-[#d3ccc0]"}`} onClick={() => edit({ fabricId: fabric.id })}><span className={`fabric-swatch ${fabric.swatch} size-[68px]`} /><span><b className="block text-xs">{fabric.name}</b><small className="muted">{fabric.article}</small></span>{fabric.id === draft.fabricId && <Check size={17} className="text-[#7a2635]" />}</button>)}</div> : <div className="space-y-3">{group?.options.filter((option) => option.isActive).map((option) => <button key={option.id} type="button" className={`flex min-h-[68px] w-full items-center justify-between gap-4 border p-4 text-left ${draft.settings[group.key] === option.key ? "border-[#7a2635] bg-[#f7efee]" : "border-[#d3ccc0]"}`} onClick={() => edit({ settings: { ...draft.settings, [group.key]: option.key } })}><span><b className="block text-sm">{option.name}</b>{option.description && <small className="muted mt-1 block">{option.description}</small>}</span>{draft.settings[group.key] === option.key && <Check size={18} className="text-[#7a2635]" />}</button>)}</div>}</div>
        <div className="mt-7 flex items-center justify-between border-t border-[#d3ccc0] pt-5"><Button variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><ChevronLeft size={17} /> Назад</Button>{step < groups.length ? <Button onClick={() => setStep((current) => Math.min(groups.length, current + 1))} disabled={step === 0 && !draft.fabricId}>Далее <ChevronRight size={17} /></Button> : <span />}</div>
      </section>
    </div>
    {step === groups.length && <section className="surface p-5 sm:p-7"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><label className="label" htmlFor="configuration-name">Название конфигурации</label><input id="configuration-name" className="input max-w-xl" value={draft.name} onChange={(event) => edit({ name: event.target.value })} aria-invalid={draft.status === "error"} /></div><Button onClick={() => void save()} disabled={draft.status === "saving" || (!dirty && Boolean(draft.id))}><Save size={17} />{draft.status === "saving" ? "Сохранение…" : dirty || !draft.id ? (draft.id ? "Сохранить изменения" : "Сохранить конфигурацию") : "Сохранено"}</Button></div>{draft.error && <p className="field-error mt-3" role="alert">{draft.error}</p>}<dl className="mt-7 grid gap-px border border-[#d3ccc0] bg-[#d3ccc0] sm:grid-cols-2 lg:grid-cols-3"><div className="bg-[#f8f5ef] p-4"><dt className="muted text-xs">Ткань</dt><dd className="mt-1 text-sm font-bold">{selectedFabric?.name ?? "—"}</dd></div>{summary.map((item) => <div key={item.group} className="bg-[#f8f5ef] p-4"><dt className="muted text-xs">{item.group}</dt><dd className="mt-1 text-sm font-bold">{item.option}</dd></div>)}</dl></section>}
  </div>;
}
