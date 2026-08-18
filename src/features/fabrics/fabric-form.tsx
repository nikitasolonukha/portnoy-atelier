"use client";
/* eslint-disable @next/next/no-img-element -- private authenticated and blob URLs are intentionally rendered directly. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Save, Trash2 } from "lucide-react";
import { fabricInputSchema } from "@/schemas/fabric";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { Button, ButtonLink, Field, PageHeading } from "@/components/ui/primitives";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { can } from "@/lib/permissions";
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

export function FabricForm({ fabricId }: { fabricId?: string }) {
  const user = useCurrentUser();
  const router = useRouter();
  const fabrics = useWorkspace((state) => state.fabrics);
  const addFabric = useWorkspace((state) => state.addFabric);
  const updateFabric = useWorkspace((state) => state.updateFabric);
  const hydrate = useWorkspace((state) => state.hydrate);
  const [createdFabricId, setCreatedFabricId] = useState<string | null>(null);
  const fabric = fabrics.find((item) => item.id === (fabricId || createdFabricId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [texture, setTexture] = useState<File | null>(null);
  const [removedAssets, setRemovedAssets] = useState<string[]>([]);
  const existingPhotos = useMemo(() => (fabric?.assets ?? []).filter((asset) => asset.type === "photo" && !removedAssets.includes(asset.id)), [fabric, removedAssets]);
  const existingTexture = (fabric?.assets ?? []).find((asset) => asset.type === "texture" && !removedAssets.includes(asset.id));
  const editing = Boolean(fabricId || createdFabricId);
  const allowed = can(user.role, editing ? "fabric:update" : "fabric:create");

  if (!allowed) return <div className="empty-state" role="alert"><h1 className="font-display text-3xl">Недостаточно прав</h1><p className="muted mt-2 text-sm">Изменение тканей недоступно для вашей роли.</p><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;
  if (fabricId && !fabric) return <div className="empty-state"><h1 className="font-display text-3xl">Ткань не найдена</h1><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;

  async function uploadAssets(targetId: string, type: "photo" | "texture", files: File[]) {
    if (!files.length) return;
    const upload = new FormData();
    files.forEach((file) => upload.append("files", file));
    upload.append("assetType", type);
    const response = await fetch(`/api/v1/fabrics/${targetId}/assets`, { method: "POST", body: upload });
    if (!response.ok) throw new Error(await responseError(response, type === "photo" ? "Не удалось загрузить фотографии" : "Не удалось загрузить текстуру"));
  }

  async function deleteAsset(targetId: string, asset: FabricAsset) {
    const response = await fetch(`/api/v1/fabrics/${targetId}/assets/${asset.id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(await responseError(response, "Не удалось удалить изображение"));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const result = fabricInputSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
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
        await uploadAssets(saved.id, "photo", photos);
        await uploadAssets(saved.id, "texture", texture ? [texture] : []);
        for (const asset of (fabric?.assets ?? []).filter((item) => removedAssets.includes(item.id) && !(item.type === "texture" && texture))) {
          await deleteAsset(saved.id, asset);
        }
        await hydrate();
      }
      router.push(`/fabrics/${saved.id}`);
    } catch (cause) {
      setErrors({ form: cause instanceof Error ? cause.message : "Не удалось сохранить ткань" });
      setPending(false);
    }
  }

  const inputProps = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });
  return <div className="space-y-8"><PageHeading eyebrow={editing ? "Редактирование" : "Новая запись"} title={editing ? "Редактировать ткань" : "Добавить ткань"} actions={<ButtonLink href={fabric ? `/fabrics/${fabric.id}` : "/fabrics"} variant="secondary"><ArrowLeft size={17} /> Назад</ButtonLink>} />
    <form onSubmit={submit} noValidate className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">{errors.form && <p className="field-error xl:col-span-2" role="alert">{errors.form}</p>}
      <div className="surface p-5 sm:p-7"><h2 className="font-display mb-6 text-2xl font-normal">Паспорт материала</h2><div className="grid gap-5 sm:grid-cols-2">
        <Field label="Артикул" id="article" required error={errors.article}><input className="input" id="article" name="article" defaultValue={fabric?.article} {...inputProps("article")} /></Field><Field label="Название" id="name" required error={errors.name}><input className="input" id="name" name="name" defaultValue={fabric?.name} {...inputProps("name")} /></Field>
        <Field label="Производитель" id="manufacturer"><input className="input" id="manufacturer" name="manufacturer" defaultValue={fabric?.manufacturer} /></Field><Field label="Коллекция" id="collection"><input className="input" id="collection" name="collection" defaultValue={fabric?.collection} /></Field>
        <Field label="Состав" id="composition"><input className="input" id="composition" name="composition" defaultValue={fabric?.composition} placeholder="100% шерсть" /></Field><Field label="Основной цвет" id="mainColor"><input className="input" id="mainColor" name="mainColor" defaultValue={fabric?.mainColor} /></Field>
        <Field label="Рисунок" id="pattern"><input className="input" id="pattern" name="pattern" defaultValue={fabric?.pattern} /></Field><Field label="Вес, г/м²" id="weightGsm" error={errors.weightGsm}><input className="input" id="weightGsm" name="weightGsm" type="number" min="0" defaultValue={fabric?.weightGsm || ""} {...inputProps("weightGsm")} /></Field>
        <Field label="Ширина, см" id="widthCm"><input className="input" id="widthCm" name="widthCm" type="number" min="0" step="0.1" defaultValue={fabric?.widthCm || ""} /></Field><Field label="Цена за метр" id="pricePerMeter" error={errors.pricePerMeter}><div className="grid grid-cols-[1fr_92px]"><input className="input border-r-0" id="pricePerMeter" name="pricePerMeter" type="number" min="0" defaultValue={fabric?.pricePerMeter || ""} {...inputProps("pricePerMeter")} /><select className="select" name="currency" aria-label="Валюта" defaultValue={fabric?.currency || "RUB"}><option>RUB</option><option>EUR</option><option>USD</option></select></div></Field>
        <div className="sm:col-span-2"><Field label="Описание" id="description"><textarea className="textarea" id="description" name="description" defaultValue={fabric?.description} /></Field></div>
      </div></div>
      <aside className="space-y-5">
        <div className="surface p-5"><h2 className="font-display text-xl font-normal">Фотографии</h2><p className="muted mt-2 text-xs">Фото используются в каталоге и карточке ткани.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">{existingPhotos.map((asset) => <div key={asset.id} className="relative aspect-square overflow-hidden border"><img src={asset.url} alt={asset.originalFilename} className="h-full w-full object-cover" /><button type="button" className="absolute right-1 top-1 grid size-9 place-items-center bg-white/90" aria-label={`Удалить ${asset.originalFilename}`} onClick={() => setRemovedAssets((current) => [...current, asset.id])}><Trash2 size={15} /></button></div>)}{photos.map((file, index) => <div key={`${file.name}-${index}`} className="relative aspect-square overflow-hidden border"><LocalImage file={file} alt={file.name} /><button type="button" className="absolute right-1 top-1 grid size-9 place-items-center bg-white/90" aria-label={`Убрать ${file.name}`} onClick={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15} /></button></div>)}</div>
          <label className="mt-4 grid min-h-28 cursor-pointer place-items-center border border-dashed border-[#afa79a] bg-[#f8f5ef] text-center"><span><ImagePlus className="mx-auto mb-1" /><b className="text-sm">Добавить фотографии</b><small className="muted block">JPG, PNG, WebP · до 10 МБ</small></span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setPhotos((current) => [...current, ...Array.from(event.target.files || [])].slice(0, 12))} /></label>
        </div>
        <div className="surface p-5"><h2 className="font-display text-xl font-normal">Текстура</h2><p className="muted mt-2 text-xs">Отдельный технический asset материала.</p>
          {(texture || existingTexture) && <div className="relative mt-4 aspect-[4/3] overflow-hidden border">{texture ? <LocalImage file={texture} alt="Новая текстура" /> : existingTexture && <img src={existingTexture.url} alt={existingTexture.originalFilename} className="h-full w-full object-cover" />}<button type="button" className="absolute right-2 top-2 grid size-10 place-items-center bg-white/90" aria-label="Удалить текстуру" onClick={() => { if (texture) setTexture(null); else if (existingTexture) setRemovedAssets((current) => [...current, existingTexture.id]); }}><Trash2 size={16} /></button></div>}
          <label className="mt-4 block"><span className="button button-secondary w-full cursor-pointer">{texture || existingTexture ? "Заменить текстуру" : "Выбрать текстуру"}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setTexture(event.target.files?.[0] ?? null)} /></label>
        </div>
        {!usesSupabase && <p className="muted text-xs">В demo mode изображения показываются только до сохранения; постоянный Storage включён в Supabase mode.</p>}
        <Button className="w-full" type="submit" disabled={pending}><Save size={17} />{pending ? "Сохраняем…" : editing ? "Сохранить изменения" : "Сохранить ткань"}</Button>
      </aside>
    </form>
  </div>;
}
