"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Save, Box, Layers } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { MaterialStage } from "@/components/ui/material-stage";
import { Suit3DStage } from "@/features/configurator/suit-3d-stage";
import { FabricMedia } from "@/components/ui/fabric-media";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { canMutateConfiguration } from "@/lib/permissions";
import {
  createConfiguratorDraft,
  isConfiguratorDirty,
  markConfiguratorSaved,
  resetConfiguratorDraft,
  shouldNavigateToCanonicalConfiguration,
  withConfiguratorEdit,
} from "./configurator-state";

const stepLabels = ["Fabric", "Jacket", "Lapel", "Buttons", "Pockets", "Trousers", "Waistcoat"];

export function SuitConfigurator({ configurationId }: { configurationId?: string }) {
  const user = useCurrentUser();
  const router = useRouter();
  const params = useSearchParams();
  const requestedId = configurationId ?? params.get("id") ?? undefined;
  const groups = useWorkspace((state) => state.groups);
  const allFabrics = useWorkspace((state) => state.fabrics);
  const configurations = useWorkspace((state) => state.configurations);
  const saveConfiguration = useWorkspace((state) => state.saveConfiguration);
  const fabrics = useMemo(() => allFabrics.filter((fabric) => fabric.isActive), [allFabrics]);
  const defaults = useMemo(
    () => Object.fromEntries(groups.map((group) => [group.key, group.options.find((option) => option.isActive)?.key ?? ""])),
    [groups],
  );
  const source = requestedId ? configurations.find((item) => item.id === requestedId) ?? null : null;
  const canEdit = !source || canMutateConfiguration(user, source.createdBy);
  const [draft, setDraft] = useState(() => createConfiguratorDraft(source, params.get("fabric") ?? fabrics[0]?.id ?? "", defaults));
  const [step, setStep] = useState(0);
  const [stageMode, setStageMode] = useState<"3d" | "2d">("2d");
  const selectedFabric = fabrics.find((fabric) => fabric.id === draft.fabricId);
  const group = step === 0 ? undefined : groups[step - 1];
  const dirty = isConfiguratorDirty(draft);
  const totalSteps = groups.length + 1;
  const constructionLabel = group?.options.find((option) => option.key === draft.settings[group.key])?.name;

  useEffect(() => {
    if (requestedId && source && draft.id !== requestedId) setDraft(createConfiguratorDraft(source, "", defaults));
  }, [defaults, draft.id, requestedId, source]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (canEdit && (dirty || draft.status === "saving")) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [canEdit, dirty, draft.status]);

  if (requestedId && !source && draft.id !== requestedId) {
    return (
      <div className="empty-state" role="alert">
        <h1 className="font-display text-3xl">Конфигурация не найдена</h1>
        <p className="muted mt-2 text-sm">Проверьте адрес или вернитесь к списку.</p>
        <Link className="button button-primary mt-5" href="/configurations">К конфигурациям</Link>
      </div>
    );
  }

  function edit(patch: Parameters<typeof withConfiguratorEdit>[1]) {
    if (!canEdit) return;
    setDraft((current) => withConfiguratorEdit(current, patch));
  }

  async function save() {
    if (!canEdit || draft.status === "saving") return;
    if (!draft.name.trim()) { setDraft((current) => ({ ...current, status: "error", error: "Укажите название конфигурации" })); return; }
    if (!draft.fabricId) { setDraft((current) => ({ ...current, status: "error", error: "Выберите ткань" })); return; }
    if (groups.some((item) => !draft.settings[item.key])) {
      setDraft((current) => ({ ...current, status: "error", error: "Выберите значение для каждой группы" }));
      return;
    }
    setDraft((current) => ({ ...current, status: "saving", error: null }));
    try {
      const now = new Date().toISOString();
      const saved = await saveConfiguration({
        id: draft.id ?? crypto.randomUUID(),
        name: draft.name.trim(),
        fabricId: draft.fabricId,
        settings: draft.settings,
        createdBy: source?.createdBy ?? user.id,
        createdAt: draft.createdAt ?? now,
        updatedAt: now,
      });
      setDraft((current) => markConfiguratorSaved(current, saved));
      if (shouldNavigateToCanonicalConfiguration(draft.id, saved.id)) {
        router.replace(`/configurator/${encodeURIComponent(saved.id)}`);
      }
    } catch (cause) {
      setDraft((current) => ({
        ...current,
        status: "error",
        error: cause instanceof Error ? cause.message : "Не удалось сохранить конфигурацию",
      }));
    }
  }

  const summary = groups.map((item) => ({
    group: item.name,
    option: item.options.find((option) => option.key === draft.settings[item.key])?.name ?? "—",
  }));
  const statusText = draft.status === "saving"
    ? "Сохранение…"
    : draft.status === "error"
      ? "Ошибка сохранения"
      : dirty || !draft.id
        ? "Есть несохранённые изменения"
        : "Все изменения сохранены";

  return (
    <div className="configurator-page">
      {!canEdit && (
        <div className="empty-state py-4" role="status">
          <p className="font-bold">Только просмотр</p>
          <p className="muted mt-1 text-sm">Эта конфигурация принадлежит другому сотруднику.</p>
        </div>
      )}

      <header className="configurator-toolbar">
        <div>
          <p className="micro-label">Bespoke configuration</p>
          <h1 className="configurator-title mt-1">Конфигуратор</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-[var(--radius-sm)] border border-[--border] bg-[--surface] p-1" role="group" aria-label="Режим просмотра">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-xs font-semibold transition-colors"
              data-active={stageMode === "3d"}
              onClick={() => setStageMode("3d")}
              aria-pressed={stageMode === "3d"}
            >
              <Box size={14} aria-hidden="true" />
              3D студия
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-xs font-semibold transition-colors"
              data-active={stageMode === "2d"}
              onClick={() => setStageMode("2d")}
              aria-pressed={stageMode === "2d"}
            >
              <Layers size={14} aria-hidden="true" />
              2D чертёж
            </button>
          </div>
          <p className={`text-xs ${draft.status === "error" ? "text-[--error]" : "text-[--ink-tertiary]"}`} role="status">{statusText}</p>
          <Link
            href="/configurations"
            className="button button-quiet"
            onClick={(event) => {
              if (canEdit && dirty && !window.confirm("Изменения не сохранены. Выйти без сохранения?")) event.preventDefault();
            }}
          >
            К вариантам
          </Link>
        </div>
      </header>

      <div className="configurator-split">
        <div className="configurator-stage">
          {stageMode === "3d" ? (
            <Suit3DStage fabric={selectedFabric} settings={draft.settings} />
          ) : (
            <MaterialStage
              fabric={selectedFabric}
              settings={draft.settings}
              stepLabel={step === 0 ? "01 Fabric" : group?.name}
              constructionLabel={constructionLabel}
            />
          )}
        </div>

        <section className="configurator-panel">
          <div className="configurator-panel__step">
            <div>
              <p className="micro-label">{String(step + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}</p>
              <h2 className="configurator-panel__step-title">{step === 0 ? "Материал" : group?.name}</h2>
            </div>
            <Button variant="quiet" className="!text-[rgba(245,241,233,.7)] hover:!bg-[rgba(245,241,233,.08)] hover:!text-[var(--ink-inverse)]" onClick={() => setDraft((current) => resetConfiguratorDraft(current))} disabled={!canEdit || !dirty || draft.status === "saving"}>
              <RotateCcw size={15} /> Сброс
            </Button>
          </div>

          <nav className="step-index" aria-label="Шаги конфигурации">
            <button type="button" data-active={step === 0} data-done={step > 0} onClick={() => setStep(0)}>
              <span className="micro-label">01</span> Fabric
            </button>
            {groups.map((item, index) => (
              <button
                key={item.key}
                type="button"
                data-active={step === index + 1}
                data-done={step > index + 1}
                onClick={() => setStep(index + 1)}
              >
                <span className="micro-label">{String(index + 2).padStart(2, "0")}</span> {stepLabels[index + 1] ?? item.name}
              </button>
            ))}
          </nav>

          <div className="configurator-panel__body">
            <div className="configurator-panel__options">
              {step === 0 ? (
                <div className="fabric-picker-grid">
                  {fabrics.map((fabric) => (
                    <button
                      key={fabric.id}
                      type="button"
                      className="option-tile-visual option-tile-visual--compact"
                      data-selected={fabric.id === draft.fabricId}
                      onClick={() => edit({ fabricId: fabric.id })}
                      disabled={!canEdit}
                    >
                      <FabricMedia fabric={fabric} aspect="aspect-square" />
                      <span className="fabric-picker-meta">
                        <span className="fabric-picker-name">{fabric.name}</span>
                        <span className="fabric-picker-article">{fabric.article}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {group?.options.filter((option) => option.isActive).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className="option-tile"
                      data-selected={draft.settings[group.key] === option.key}
                      onClick={() => edit({ settings: { ...draft.settings, [group.key]: option.key } })}
                      disabled={!canEdit}
                    >
                      <span>
                        <b className="block text-sm">{option.name}</b>
                        {option.description && <small className="muted mt-1 block text-xs">{option.description}</small>}
                      </span>
                      {draft.settings[group.key] === option.key && <Check size={18} className="text-[--accent]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="configurator-panel__nav">
            <Button variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
              <ChevronLeft size={17} /> Назад
            </Button>
            {step < groups.length ? (
              <Button onClick={() => setStep((current) => Math.min(groups.length, current + 1))} disabled={step === 0 && !draft.fabricId}>
                Далее <ChevronRight size={17} />
              </Button>
            ) : (
              <span />
            )}
          </div>
        </section>
      </div>

      {step === groups.length && (
        <section className="surface p-4 md:p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="label" htmlFor="configuration-name">Название конфигурации</label>
              <input id="configuration-name" className="input max-w-xl" value={draft.name} onChange={(event) => edit({ name: event.target.value })} readOnly={!canEdit} aria-invalid={draft.status === "error"} />
            </div>
            <Button onClick={() => void save()} disabled={!canEdit || draft.status === "saving" || (!dirty && Boolean(draft.id))}>
              <Save size={17} />
              {draft.status === "saving" ? "Сохранение…" : dirty || !draft.id ? (draft.id ? "Сохранить изменения" : "Сохранить конфигурацию") : "Сохранено"}
            </Button>
          </div>
          {draft.error && <p className="field-error mt-3" role="alert">{draft.error}</p>}
          <dl className="mt-6 grid gap-px border border-[--border] bg-[--border] sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[--canvas-elevated] p-3.5">
              <dt className="micro-label">Ткань</dt>
              <dd className="mt-1.5 text-sm font-semibold">{selectedFabric?.name ?? "—"}</dd>
            </div>
            {summary.map((item) => (
              <div key={item.group} className="bg-[--canvas-elevated] p-3.5">
                <dt className="micro-label">{item.group}</dt>
                <dd className="mt-1.5 text-sm font-semibold">{item.option}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
