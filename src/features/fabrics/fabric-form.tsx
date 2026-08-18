"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { fabricInputSchema } from "@/schemas/fabric";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { Button, ButtonLink, Field, PageHeading } from "@/components/ui/primitives";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { can } from "@/lib/permissions";

const usesSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";

export function FabricForm() {
  const user = useCurrentUser();
  const router = useRouter(); const addFabric = useWorkspace((state) => state.addFabric); const [errors, setErrors] = useState<Record<string,string>>({}); const [pending, setPending] = useState(false); const [files, setFiles] = useState<File[]>([]);
  if (!can(user.role, "fabric:create")) return <div className="empty-state" role="alert"><h1 className="font-display text-3xl">Недостаточно прав</h1><p className="muted mt-2 text-sm">Создание тканей недоступно для вашей роли.</p><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const raw = Object.fromEntries(new FormData(event.currentTarget)); const result = fabricInputSchema.safeParse(raw);
    if (!result.success) { setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return; }
    setPending(true); setErrors({}); const now = new Date().toISOString(); const id = crypto.randomUUID();
    try {
      const created = await addFabric({ id, ...result.data, manufacturer: result.data.manufacturer || "Не указана", collection: result.data.collection || "", composition: result.data.composition || "Не указано", mainColor: result.data.mainColor || "Не указан", pattern: result.data.pattern || "Не указан", weightGsm: result.data.weightGsm || 0, widthCm: result.data.widthCm || 0, pricePerMeter: result.data.pricePerMeter || 0, isActive: true, swatch: "charcoal", createdAt: now, updatedAt: now });
      if (usesSupabase && files.length) {
        const upload = new FormData(); files.forEach((file) => upload.append("files", file)); upload.append("assetType", "photo");
        const response = await fetch(`/api/v1/fabrics/${created.id}/assets`, { method: "POST", body: upload });
        if (!response.ok) { const payload = await response.json().catch(() => null); throw new Error(payload?.error?.message || "Не удалось загрузить изображения"); }
      }
      router.push(`/fabrics/${created.id}`);
    } catch (cause) { setErrors({ form: cause instanceof Error ? cause.message : "Не удалось сохранить ткань" }); setPending(false); }
  }
  const inputProps = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });
  return <div className="space-y-8"><PageHeading eyebrow="Новая запись" title="Добавить ткань" actions={<ButtonLink href="/fabrics" variant="secondary"><ArrowLeft size={17} /> К каталогу</ButtonLink>} />
    <form onSubmit={submit} noValidate className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">{errors.form && <p className="field-error xl:col-span-2" role="alert">{errors.form}</p>}
      <div className="surface p-5 sm:p-7"><h2 className="font-display mb-6 text-2xl font-normal">Паспорт материала</h2><div className="grid gap-5 sm:grid-cols-2">
        <Field label="Артикул" id="article" required error={errors.article}><input className="input" id="article" name="article" {...inputProps("article")} /></Field><Field label="Название" id="name" required error={errors.name}><input className="input" id="name" name="name" {...inputProps("name")} /></Field>
        <Field label="Производитель" id="manufacturer"><input className="input" id="manufacturer" name="manufacturer" /></Field><Field label="Коллекция" id="collection"><input className="input" id="collection" name="collection" /></Field>
        <Field label="Состав" id="composition"><input className="input" id="composition" name="composition" placeholder="100% шерсть" /></Field><Field label="Основной цвет" id="mainColor"><input className="input" id="mainColor" name="mainColor" /></Field>
        <Field label="Рисунок" id="pattern"><input className="input" id="pattern" name="pattern" /></Field><Field label="Вес, г/м²" id="weightGsm" error={errors.weightGsm}><input className="input" id="weightGsm" name="weightGsm" type="number" min="0" {...inputProps("weightGsm")} /></Field>
        <Field label="Ширина, см" id="widthCm"><input className="input" id="widthCm" name="widthCm" type="number" min="0" step="0.1" /></Field><Field label="Цена за метр" id="pricePerMeter" error={errors.pricePerMeter}><div className="grid grid-cols-[1fr_92px]"><input className="input border-r-0" id="pricePerMeter" name="pricePerMeter" type="number" min="0" {...inputProps("pricePerMeter")} /><select className="select" name="currency" aria-label="Валюта"><option>RUB</option><option>EUR</option><option>USD</option></select></div></Field>
        <div className="sm:col-span-2"><Field label="Описание" id="description"><textarea className="textarea" id="description" name="description" /></Field></div>
      </div></div>
      <aside className="space-y-5"><div className="surface p-5"><h2 className="font-display text-xl font-normal">Фотографии ткани</h2>{usesSupabase ? <><p className="muted mt-2 text-xs leading-5">Файлы проверяются и сохраняются в закрытом Storage.</p><label className="mt-5 grid min-h-40 cursor-pointer place-items-center border border-dashed border-[#afa79a] bg-[#f8f5ef] text-center"><span><ImagePlus className="mx-auto mb-2" /><b className="text-sm">Выбрать файлы</b><small className="muted mt-1 block">JPG, PNG, WebP · до 10 МБ · не более 12</small>{files.length > 0 && <small className="mt-2 block font-bold">Выбрано: {files.length}</small>}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 12))} /></label></> : <p className="muted mt-2 text-xs leading-5">В демонстрационном режиме постоянное хранилище не используется. При APP_MODE=supabase здесь включается защищённая загрузка.</p>}</div><Button className="w-full" type="submit" disabled={pending}><Save size={17} />{pending ? "Сохраняем…" : "Сохранить ткань"}</Button></aside>
    </form>
  </div>;
}
