"use client";
/* eslint-disable @next/next/no-img-element -- private authenticated assets are intentionally rendered directly. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArrowLeft, Pencil, RotateCcw, Settings2, Trash2 } from "lucide-react";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { formatDate, formatMoney } from "@/lib/utils";
import { Button, ButtonLink, PageHeading } from "@/components/ui/primitives";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { can } from "@/lib/permissions";

export function FabricDetail({ id }: { id: string }) {
  const user = useCurrentUser();
  const router = useRouter();
  const fabric = useWorkspace((state) => state.fabrics.find((item) => item.id === id));
  const updateFabric = useWorkspace((state) => state.updateFabric);
  const hydrate = useWorkspace((state) => state.hydrate);
  const [pending, setPending] = useState<"archive" | "delete" | null>(null);
  const [error, setError] = useState("");
  if (!fabric) return <div className="empty-state"><h1 className="font-display text-3xl">Ткань не найдена</h1><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;

  const photos = (fabric.assets ?? []).filter((asset) => asset.type === "photo");
  const texture = (fabric.assets ?? []).find((asset) => asset.type === "texture");
  const rows = [["Производитель", fabric.manufacturer || "—"], ["Коллекция", fabric.collection || "—"], ["Состав", fabric.composition || "—"], ["Цвет", fabric.mainColor || "—"], ["Рисунок", fabric.pattern || "—"], ["Вес", fabric.weightGsm ? `${fabric.weightGsm} г/м²` : "—"], ["Ширина", fabric.widthCm ? `${fabric.widthCm} см` : "—"]];

  async function toggleArchive() {
    if (pending) return;
    setPending("archive");
    setError("");
    try {
      await updateFabric(id, { isActive: !fabric?.isActive });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось изменить статус ткани");
    } finally {
      setPending(null);
    }
  }

  async function deleteFabric() {
    if (pending || !window.confirm(`Удалить ткань «${fabric?.name}»?`)) return;
    setPending("delete");
    setError("");
    try {
      const response = await fetch(`/api/v1/fabrics/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || "Не удалось удалить ткань");
      }
      await hydrate({ background: true });
      router.replace("/fabrics");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось удалить ткань");
      setPending(null);
    }
  }

  return <div className="space-y-8"><PageHeading eyebrow={`Артикул ${fabric.article}`} title={fabric.name} actions={<><ButtonLink href="/fabrics" variant="secondary"><ArrowLeft size={17} /> Каталог</ButtonLink>{can(user.role, "fabric:update") && <ButtonLink href={`/fabrics/${fabric.id}/edit`} variant="secondary"><Pencil size={17} /> Редактировать</ButtonLink>}<ButtonLink href={`/configurator?fabric=${fabric.id}`}><Settings2 size={17} /> В конфигуратор</ButtonLink></>} />
    {error && <p className="field-error" role="alert">{error}{error.includes("используется") && " Архивируйте ткань вместо удаления."}</p>}
    <div className="grid gap-8 xl:grid-cols-[minmax(360px,.85fr)_minmax(0,1.15fr)]">
      <div>{photos[0] ? <img src={photos[0].url} alt={photos[0].originalFilename} className="aspect-[1.15] w-full object-cover" /> : <div className={`fabric-swatch ${fabric.swatch} aspect-[1.15]`} />}
        {photos.length > 1 && <div className="mt-3 grid grid-cols-3 gap-2">{photos.slice(1).map((asset) => <img key={asset.id} src={asset.url} alt={asset.originalFilename} className="aspect-square w-full object-cover" />)}</div>}
        {texture && <div className="mt-6"><p className="eyebrow mb-2">Текстура</p><img src={texture.url} alt={texture.originalFilename} className="aspect-[4/3] w-full max-w-sm object-cover" /></div>}
      </div>
      <div><div className="flex items-start justify-between gap-5 border-b border-[#d3ccc0] pb-5"><div><p className="muted text-xs uppercase tracking-[.12em]">Цена за метр</p><p className="font-display mt-2 text-4xl">{formatMoney(fabric.pricePerMeter, fabric.currency)}</p></div><span className={`px-3 py-1.5 text-xs font-bold ${fabric.isActive ? "bg-[#dfe8df] text-[#34523e]" : "bg-[#e5dfd7] text-[#5e5b55]"}`}>{fabric.isActive ? "Активна" : "В архиве"}</span></div>
        <dl className="divide-y divide-[#d3ccc0]">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[140px_1fr] gap-5 py-3.5 text-sm"><dt className="muted">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl>
        {fabric.description && <div className="mt-7"><h2 className="font-display text-2xl font-normal">О материале</h2><p className="muted mt-3 max-w-2xl text-sm leading-6">{fabric.description}</p></div>}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-[#d3ccc0] pt-5">{can(user.role, "fabric:archive") && <Button variant="secondary" disabled={Boolean(pending)} onClick={toggleArchive}>{fabric.isActive ? <Archive size={16} /> : <RotateCcw size={16} />}{pending === "archive" ? "Сохраняем…" : fabric.isActive ? "Архивировать" : "Вернуть из архива"}</Button>}{can(user.role, "fabric:delete") && <Button variant="secondary" disabled={Boolean(pending)} onClick={deleteFabric}><Trash2 size={16} />{pending === "delete" ? "Удаляем…" : "Удалить"}</Button>}</div>
        <p className="muted mt-4 text-xs">Обновлено {formatDate(fabric.updatedAt)}</p>
      </div>
    </div>
  </div>;
}
