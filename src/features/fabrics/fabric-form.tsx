"use client";
/* eslint-disable @next/next/no-img-element -- private authenticated and blob URLs are intentionally rendered directly. */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Save, Settings2, Star, Trash2 } from "lucide-react";
import { fabricInputSchema } from "@/schemas/fabric";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { Button, ButtonLink, Field } from "@/components/ui/primitives";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { can } from "@/lib/permissions";
import {
  appendDraftPhotos,
  draftPhotosFromAssets,
  makeDraftPhotoMain,
  MAX_FABRIC_PHOTOS,
  moveDraftPhoto,
  pendingDraftFiles,
  removeDraftPhoto,
  removedExistingPhotoIds,
  resolveFinalPhotoOrder,
  type DraftPhoto,
} from "@/lib/draft-photos";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import type { FabricAsset } from "@/types/domain";

const usesSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";

function LocalImage({ file, alt }: { file: File; alt: string }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);
  return <img src={url} alt={alt} className="h-full w-full object-cover" />;
}

async function responseError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  return payload?.error?.message || fallback;
}

function draftLabel(photo: DraftPhoto) {
  return photo.kind === "existing" ? photo.asset.originalFilename : photo.file.name;
}

export function FabricForm({ fabricId }: { fabricId?: string }) {
  const user = useCurrentUser();
  const fabrics = useWorkspace((state) => state.fabrics);
  const addFabric = useWorkspace((state) => state.addFabric);
  const updateFabric = useWorkspace((state) => state.updateFabric);
  const hydrate = useWorkspace((state) => state.hydrate);
  const [createdFabricId, setCreatedFabricId] = useState<string | null>(null);
  const fabric = fabrics.find((item) => item.id === (fabricId || createdFabricId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [draftPhotos, setDraftPhotos] = useState<DraftPhoto[]>([]);
  const [seedPhotos, setSeedPhotos] = useState<DraftPhoto[]>([]);
  const [seededFabricId, setSeededFabricId] = useState<string | null>(null);
  const [texture, setTexture] = useState<File | null>(null);
  const [removedTextureId, setRemovedTextureId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const editing = Boolean(fabricId || createdFabricId);
  const allowed = can(user.role, editing ? "fabric:update" : "fabric:create");
  const {
    leaveOpen,
    requestLeave,
    stay,
    leaveWithoutSaving,
    navigateAfterSave,
  } = useUnsavedChangesGuard(dirty);

  useEffect(() => {
    if (!fabric) return;
    if (seededFabricId === fabric.id) return;
    const seeded = draftPhotosFromAssets(fabric.assets ?? []);
    setDraftPhotos(seeded);
    setSeedPhotos(seeded);
    setSeededFabricId(fabric.id);
    setRemovedTextureId(null);
  }, [fabric, seededFabricId]);

  const existingTexture = (fabric?.assets ?? []).find(
    (asset) => asset.type === "texture" && asset.id !== removedTextureId,
  );

  if (!allowed) return <div className="empty-state" role="alert"><h1 className="section-title">Недостаточно прав</h1><p className="muted mt-2 text-sm">Изменение тканей недоступно для вашей роли.</p><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;
  if (fabricId && !fabric) return <div className="empty-state"><h1 className="section-title">Ткань не найдена</h1><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;

  function markDirty() {
    setDirty(true);
  }

  function updateDraft(next: DraftPhoto[]) {
    setDraftPhotos(next);
    markDirty();
  }

  async function uploadAssets(targetId: string, type: "photo" | "texture", files: File[]) {
    if (!files.length) return [] as Array<{ id: string }>;
    const upload = new FormData();
    files.forEach((file) => upload.append("files", file));
    upload.append("assetType", type);
    const response = await fetch(`/api/v1/fabrics/${targetId}/assets`, { method: "POST", body: upload });
    if (!response.ok) throw new Error(await responseError(response, type === "photo" ? "Не удалось загрузить фотографии" : "Не удалось загрузить текстуру"));
    const payload = await response.json();
    const assets = Array.isArray(payload?.data) ? payload.data : [];
    return assets as Array<{ id: string }>;
  }

  async function deleteAsset(targetId: string, assetId: string) {
    const response = await fetch(`/api/v1/fabrics/${targetId}/assets/${assetId}`, { method: "DELETE" });
    if (!response.ok) throw new Error(await responseError(response, "Не удалось удалить изображение"));
  }

  async function persistPhotoOrder(targetId: string, orderedIds: string[]) {
    if (!usesSupabase || orderedIds.length === 0) return;
    const response = await fetch(`/api/v1/fabrics/${targetId}/assets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: orderedIds.map((id, sortOrder) => ({ id, sortOrder })) }),
    });
    if (!response.ok) throw new Error(await responseError(response, "Не удалось сохранить порядок фотографий"));
  }

  async function saveFabric(form: HTMLFormElement, openConfigurator: boolean) {
    if (pending) return;
    const result = fabricInputSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    if (draftPhotos.length > MAX_FABRIC_PHOTOS) {
      setErrors({ form: `Можно добавить не больше ${MAX_FABRIC_PHOTOS} фотографий.` });
      return;
    }
    setPending(true);
    setErrors({});
    try {
      const now = new Date().toISOString();
      const saved = fabric
        ? await updateFabric(fabric.id, result.data)
        : await addFabric({ id: crypto.randomUUID(), ...result.data, manufacturer: result.data.manufacturer || "", collection: result.data.collection || "", composition: result.data.composition || "", mainColor: result.data.mainColor || "", pattern: result.data.pattern || "", weightGsm: result.data.weightGsm || 0, widthCm: result.data.widthCm || 0, pricePerMeter: result.data.pricePerMeter || 0, isActive: true, swatch: "charcoal", assets: [], createdAt: now, updatedAt: now });
      setCreatedFabricId(saved.id);
      if (usesSupabase) {
        const deletedPhotoIds = removedExistingPhotoIds(seedPhotos, draftPhotos);
        for (const assetId of deletedPhotoIds) {
          await deleteAsset(saved.id, assetId);
        }
        if (removedTextureId && !texture) {
          await deleteAsset(saved.id, removedTextureId);
        }

        const pendingPhotos = draftPhotos.filter((photo): photo is Extract<DraftPhoto, { kind: "new" }> => photo.kind === "new");
        const uploadedPhotos = await uploadAssets(saved.id, "photo", pendingDraftFiles(draftPhotos));
        if (uploadedPhotos.length !== pendingPhotos.length) {
          throw new Error("Ответ загрузки фотографий не совпал с черновиком");
        }
        const uploadedByTempId = new Map(pendingPhotos.map((photo, index) => [photo.tempId, uploadedPhotos[index]!.id]));

        await uploadAssets(saved.id, "texture", texture ? [texture] : []);

        const finalOrder = resolveFinalPhotoOrder(draftPhotos, uploadedByTempId);
        await persistPhotoOrder(saved.id, finalOrder);
        await hydrate({ background: true });
      }
      setDirty(false);
      setTexture(null);
      setRemovedTextureId(null);
      navigateAfterSave(openConfigurator ? `/configurator?fabric=${saved.id}` : `/fabrics/${saved.id}`);
    } catch (cause) {
      setErrors({ form: cause instanceof Error ? cause.message : "Не удалось сохранить ткань" });
      setPending(false);
    }
  }

  const inputProps = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });
  const backHref = fabric ? `/fabrics/${fabric.id}` : "/fabrics";

  return <div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="micro-label">{editing ? "Edit dossier" : "New material"}</p>
        <h1 className="page-title mt-3">{editing ? "Редактировать ткань" : "Добавить ткань"}</h1>
      </div>
      <Button type="button" variant="secondary" onClick={() => requestLeave(backHref)}><ArrowLeft size={17} /> Назад</Button>
    </header>
    <form
      onSubmit={(event) => { event.preventDefault(); void saveFabric(event.currentTarget, false); }}
      onChange={markDirty}
      noValidate
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.85fr)]"
    >
      {errors.form && <p className="field-error xl:col-span-2" role="alert">{errors.form}</p>}
      <div className="space-y-6">
        <section className="form-section-surface">
          <p className="micro-label mb-4">Identity</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Артикул" id="article" required error={errors.article}><input className="input" id="article" name="article" defaultValue={fabric?.article} {...inputProps("article")} /></Field>
            <Field label="Название" id="name" required error={errors.name}><input className="input" id="name" name="name" defaultValue={fabric?.name} {...inputProps("name")} /></Field>
            <Field label="Производитель" id="manufacturer"><input className="input" id="manufacturer" name="manufacturer" defaultValue={fabric?.manufacturer} /></Field>
            <Field label="Коллекция" id="collection"><input className="input" id="collection" name="collection" defaultValue={fabric?.collection} /></Field>
          </div>
        </section>
        <section className="form-section-surface">
          <p className="micro-label mb-4">Material</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Состав" id="composition"><input className="input" id="composition" name="composition" defaultValue={fabric?.composition} placeholder="100% шерсть" /></Field>
            <Field label="Основной цвет" id="mainColor"><input className="input" id="mainColor" name="mainColor" defaultValue={fabric?.mainColor} /></Field>
            <Field label="Рисунок" id="pattern"><input className="input" id="pattern" name="pattern" defaultValue={fabric?.pattern} /></Field>
            <Field label="Вес, г/м²" id="weightGsm" error={errors.weightGsm}><input className="input" id="weightGsm" name="weightGsm" type="number" min="0" defaultValue={fabric?.weightGsm || ""} {...inputProps("weightGsm")} /></Field>
            <Field label="Ширина, см" id="widthCm"><input className="input" id="widthCm" name="widthCm" type="number" min="0" step="0.1" defaultValue={fabric?.widthCm || ""} /></Field>
          </div>
        </section>
        <section className="form-section-surface">
          <p className="micro-label mb-4">Commercial</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Цена за метр" id="pricePerMeter" error={errors.pricePerMeter}><div className="grid grid-cols-[1fr_92px]"><input className="input border-r-0" id="pricePerMeter" name="pricePerMeter" type="number" min="0" defaultValue={fabric?.pricePerMeter || ""} {...inputProps("pricePerMeter")} /><select className="select" name="currency" aria-label="Валюта" defaultValue={fabric?.currency || "RUB"}><option>RUB</option><option>EUR</option><option>USD</option></select></div></Field>
            <div className="sm:col-span-2"><Field label="Описание" id="description"><textarea className="textarea" id="description" name="description" defaultValue={fabric?.description} /></Field></div>
          </div>
        </section>
      </div>
      <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <section className="form-media-stage">
          <p className="micro-label mb-4">Visual assets</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {draftPhotos.map((photo, index) => (
              <div key={photo.key} className="relative aspect-square overflow-hidden rounded-[10px] border border-[rgba(245,241,233,.12)] bg-[var(--graphite-elevated)]">
                {photo.kind === "existing"
                  ? <img src={photo.asset.url} alt={photo.asset.originalFilename} className="h-full w-full object-cover" />
                  : <LocalImage file={photo.file} alt={photo.file.name} />}
                <div className="absolute inset-x-1 bottom-1 flex flex-wrap gap-1">
                  <button type="button" className="grid size-11 place-items-center rounded-[8px] bg-[rgba(25,27,25,.85)] text-[var(--ink-inverse)]" aria-label={`Сделать главным фото ${draftLabel(photo)}`} onClick={() => updateDraft(makeDraftPhotoMain(draftPhotos, photo.key))}>
                    <Star size={15} fill={index === 0 ? "currentColor" : "none"} />
                  </button>
                  <button type="button" className="grid size-11 place-items-center rounded-[8px] bg-[rgba(25,27,25,.85)] text-[var(--ink-inverse)] disabled:opacity-40" aria-label={`Переместить выше ${draftLabel(photo)}`} disabled={index === 0} onClick={() => updateDraft(moveDraftPhoto(draftPhotos, index, index - 1))}>
                    <ArrowUp size={15} />
                  </button>
                  <button type="button" className="grid size-11 place-items-center rounded-[8px] bg-[rgba(25,27,25,.85)] text-[var(--ink-inverse)] disabled:opacity-40" aria-label={`Переместить ниже ${draftLabel(photo)}`} disabled={index === draftPhotos.length - 1} onClick={() => updateDraft(moveDraftPhoto(draftPhotos, index, index + 1))}>
                    <ArrowDown size={15} />
                  </button>
                  <button type="button" className="grid size-11 place-items-center rounded-[8px] bg-[rgba(25,27,25,.85)] text-[var(--ink-inverse)]" aria-label={`Удалить ${draftLabel(photo)}`} onClick={() => updateDraft(removeDraftPhoto(draftPhotos, photo.key))}>
                    <Trash2 size={15} />
                  </button>
                </div>
                {index === 0 && <span className="absolute left-1 top-1 rounded-[6px] bg-[rgba(25,27,25,.85)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--ink-inverse)]">Главное</span>}
              </div>
            ))}
          </div>
          <label className="mt-4 grid min-h-28 cursor-pointer place-items-center rounded-[12px] border border-dashed border-[rgba(245,241,233,.18)] bg-[rgba(245,241,233,.04)] text-center transition-colors hover:border-[rgba(245,241,233,.3)]">
            <span>
              <ImagePlus className="mx-auto mb-1 text-[var(--bronze)]" />
              <b className="text-sm text-[var(--ink-inverse)]">Добавить фотографии</b>
              <small className="mt-1 block text-[rgba(245,241,233,.5)]">JPG, PNG, WebP · до 10 МБ · максимум {MAX_FABRIC_PHOTOS}</small>
            </span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                event.target.value = "";
                const result = appendDraftPhotos(draftPhotos, files);
                setDraftPhotos(result.photos);
                if (files.length) markDirty();
                if (result.error) setErrors((current) => ({ ...current, form: result.error! }));
                else setErrors((current) => {
                  const next = { ...current };
                  delete next.form;
                  return next;
                });
              }}
            />
          </label>
          <div className="mt-6 border-t border-[rgba(245,241,233,.1)] pt-5">
            <p className="micro-label mb-3">Texture map</p>
            {(texture || existingTexture) && <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[rgba(245,241,233,.12)] bg-[var(--graphite-elevated)]">{texture ? <LocalImage file={texture} alt="Новая текстура" /> : existingTexture && <img src={existingTexture.url} alt={existingTexture.originalFilename} className="h-full w-full object-cover" />}<button type="button" className="absolute right-2 top-2 grid size-11 place-items-center rounded-[8px] bg-[rgba(25,27,25,.85)] text-[var(--ink-inverse)]" aria-label="Удалить текстуру" onClick={() => { if (texture) setTexture(null); else if (existingTexture) setRemovedTextureId(existingTexture.id); markDirty(); }}><Trash2 size={16} /></button></div>}
            <label className="mt-4 block"><span className="button button-secondary w-full cursor-pointer dashboard-hero__cta">{texture || existingTexture ? "Заменить текстуру" : "Выбрать текстуру"}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setTexture(event.target.files?.[0] ?? null); markDirty(); }} /></label>
          </div>
        </section>
        {!usesSupabase && <p className="muted text-xs">В demo mode изображения показываются только до сохранения; постоянный Storage включён в Supabase mode.</p>}
        <Button className="w-full" type="submit" disabled={pending}><Save size={17} />{pending ? "Сохраняем…" : editing ? "Сохранить изменения" : "Сохранить ткань"}</Button>
        <Button className="w-full" type="button" variant="secondary" disabled={pending} onClick={(event) => { const form = event.currentTarget.form; if (form) void saveFabric(form, true); }}>
          <Settings2 size={17} />{pending ? "Сохраняем…" : "Сохранить и открыть в конфигураторе"}
        </Button>
      </aside>
    </form>

    {leaveOpen && createPortal(
      <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(25,27,25,.55)] p-4" role="dialog" aria-modal="true" aria-labelledby="unsaved-title">
        <div className="w-full max-w-md rounded-[14px] border border-[--border] bg-[--surface] p-6 shadow-[var(--elev-2-shadow)]">
          <h2 id="unsaved-title" className="font-display text-2xl">Есть несохранённые изменения.</h2>
          <p className="muted mt-3 text-sm">Сохраните ткань или выйдите без сохранения.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" onClick={stay}>Остаться</Button>
            <Button type="button" variant="secondary" onClick={leaveWithoutSaving}>Выйти без сохранения</Button>
          </div>
        </div>
      </div>,
      document.body,
    )}
  </div>;
}
