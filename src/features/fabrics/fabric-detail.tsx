"use client";

import { useRouter } from "next/navigation";
import { Archive, ArrowLeft, Pencil, RotateCcw, Settings2 } from "lucide-react";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { formatDate, formatMoney } from "@/lib/utils";
import { Button, ButtonLink, PageHeading } from "@/components/ui/primitives";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { can } from "@/lib/permissions";

export function FabricDetail({ id }: { id: string }) {
  const user = useCurrentUser();
  const router = useRouter(); const fabric = useWorkspace((state) => state.fabrics.find((item) => item.id === id)); const updateFabric = useWorkspace((state) => state.updateFabric);
  if (!fabric) return <div className="empty-state"><h1 className="font-display text-3xl">Ткань не найдена</h1><ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink></div>;
  const rows = [["Производитель", fabric.manufacturer], ["Коллекция", fabric.collection || "—"], ["Состав", fabric.composition], ["Цвет", fabric.mainColor], ["Рисунок", fabric.pattern], ["Вес", fabric.weightGsm ? `${fabric.weightGsm} г/м²` : "—"], ["Ширина", fabric.widthCm ? `${fabric.widthCm} см` : "—"]];
  return <div className="space-y-8"><PageHeading eyebrow={`Артикул ${fabric.article}`} title={fabric.name} actions={<><ButtonLink href="/fabrics" variant="secondary"><ArrowLeft size={17} /> Каталог</ButtonLink><ButtonLink href={`/configurator?fabric=${fabric.id}`}><Settings2 size={17} /> В конфигуратор</ButtonLink></>} />
    <div className="grid gap-8 xl:grid-cols-[minmax(360px,.85fr)_minmax(0,1.15fr)]"><div><div className={`fabric-swatch ${fabric.swatch} aspect-[1.15]`} /><div className="mt-3 grid grid-cols-3 gap-2">{[1,2,3].map((n) => <div key={n} className={`fabric-swatch ${fabric.swatch} aspect-square opacity-${n === 1 ? "100" : "80"}`} />)}</div></div>
      <div><div className="flex items-start justify-between gap-5 border-b border-[#d3ccc0] pb-5"><div><p className="muted text-xs uppercase tracking-[.12em]">Цена за метр</p><p className="font-display mt-2 text-4xl">{formatMoney(fabric.pricePerMeter, fabric.currency)}</p></div><span className={`px-3 py-1.5 text-xs font-bold ${fabric.isActive ? "bg-[#dfe8df] text-[#34523e]" : "bg-[#e5dfd7] text-[#5e5b55]"}`}>{fabric.isActive ? "Активна" : "В архиве"}</span></div>
        <dl className="divide-y divide-[#d3ccc0]">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[140px_1fr] gap-5 py-3.5 text-sm"><dt className="muted">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl>
        {fabric.description && <div className="mt-7"><h2 className="font-display text-2xl font-normal">О материале</h2><p className="muted mt-3 max-w-2xl text-sm leading-6">{fabric.description}</p></div>}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-[#d3ccc0] pt-5">{can(user.role, "fabric:create") && <Button variant="secondary" onClick={() => router.push(`/fabrics/new?copy=${fabric.id}`)}><Pencil size={16} /> Дублировать</Button>}{can(user.role, "fabric:archive") && <Button variant="secondary" onClick={() => updateFabric(id, { isActive: !fabric.isActive })}>{fabric.isActive ? <Archive size={16} /> : <RotateCcw size={16} />}{fabric.isActive ? "Архивировать" : "Вернуть из архива"}</Button>}</div><p className="muted mt-4 text-xs">Обновлено {formatDate(fabric.updatedAt)}</p>
      </div></div>
  </div>;
}
