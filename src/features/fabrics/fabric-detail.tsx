"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArrowLeft, Pencil, RotateCcw, Settings2, Trash2 } from "lucide-react";
import { useWorkspace } from "@/features/workspace/workspace-store";
import { formatDate, formatMoney } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/primitives";
import { FabricMedia } from "@/components/ui/fabric-media";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { fabricTexture } from "@/lib/fabric-visual";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!fabric) {
    return (
      <div className="empty-state">
        <h1 className="section-title">Ткань не найдена</h1>
        <ButtonLink href="/fabrics" className="mt-5">Вернуться в каталог</ButtonLink>
      </div>
    );
  }

  const photos = (fabric.assets ?? []).filter((asset) => asset.type === "photo");
  const texture = fabricTexture(fabric);
  const specs = [
    ["Производитель", fabric.manufacturer || "—"],
    ["Коллекция", fabric.collection || "—"],
    ["Состав", fabric.composition || "—"],
    ["Цвет", fabric.mainColor || "—"],
    ["Рисунок", fabric.pattern || "—"],
    ["Плотность", fabric.weightGsm ? `${fabric.weightGsm} г/м²` : "—"],
    ["Ширина", fabric.widthCm ? `${fabric.widthCm} см` : "—"],
  ] as const;

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

  return (
    <div className="fabric-dossier">
      <header className="fabric-dossier__header">
        <div className="min-w-0 fabric-dossier__title-block">
          <p className="micro-label">Material dossier · {fabric.article}</p>
          <h1 className="fabric-dossier__title">{fabric.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2 ml-auto">
          <ButtonLink href="/fabrics" variant="secondary"><ArrowLeft size={16} /> Каталог</ButtonLink>
          {can(user.role, "fabric:update") && (
            <ButtonLink href={`/fabrics/${fabric.id}/edit`} variant="secondary"><Pencil size={16} /> Редактировать</ButtonLink>
          )}
          <ButtonLink href={`/configurator?fabric=${fabric.id}`}><Settings2 size={16} /> В конфигуратор</ButtonLink>
        </div>
      </header>

      {error && <p className="field-error" role="alert">{error}</p>}

      <div className="fabric-dossier__grid">
        <div className="fabric-dossier__media">
          {photos[0] ? (
            <img src={photos[0].url} alt={photos[0].originalFilename} className="detail-photo fabric-dossier__photo" />
          ) : (
            <FabricMedia fabric={fabric} aspect="aspect-[5/4]" className="fabric-dossier__photo !rounded-[14px]" />
          )}
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {photos.slice(1).map((asset) => (
                <img key={asset.id} src={asset.url} alt={asset.originalFilename} className="detail-thumb aspect-square w-full object-cover" />
              ))}
            </div>
          )}
          {texture && (
            <div className="mt-4">
              <p className="micro-label mb-2">Texture map</p>
              <button
                type="button"
                className="block w-full max-w-sm overflow-hidden rounded-[12px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--accent]"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Открыть текстуру ${texture.originalFilename} на весь экран`}
              >
                <img src={texture.url} alt={texture.originalFilename} className="detail-photo aspect-[5/3] w-full object-cover" />
              </button>
            </div>
          )}
        </div>

        <div className="fabric-dossier__specs">
          <div className="fabric-dossier__panel-title pb-5">
            <p className="micro-label">Material dossier · {fabric.article}</p>
            <h1 className="fabric-dossier__title" style={{ color: "var(--ink-inverse)" }}>{fabric.name}</h1>
          </div>

          <div className="pb-4">
            <p className="micro-label">Commercial</p>
            <p className="fabric-dossier__price mt-1.5 text-[1.75rem] font-medium leading-none tracking-[-0.02em] md:text-[2rem]">
              {formatMoney(fabric.pricePerMeter, fabric.currency)}
            </p>
            <p className="mt-1.5 text-xs font-medium" style={{ color: "rgba(245,241,233,.5)" }}>за погонный метр</p>
            <span
              className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em]"
              style={{ color: fabric.isActive ? "rgba(245,241,233,.72)" : "rgba(245,241,233,.4)" }}
            >
              <span className="inline-block size-1.5 rounded-full" style={{ background: fabric.isActive ? "var(--bronze)" : "rgba(245,241,233,.35)" }} aria-hidden="true" />
              {fabric.isActive ? "Активна" : "В архиве"}
            </span>
          </div>

          <dl className="spec-sheet">
            {specs.map(([label, value]) => (
              <div key={label} className="spec-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {fabric.description && (
            <div className="mt-5">
              <p className="micro-label">Notes</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "rgba(245,241,233,.62)" }}>{fabric.description}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 border-t border-[rgba(245,241,233,.1)] pt-4">
            {can(user.role, "fabric:archive") && (
              <Button variant="secondary" disabled={Boolean(pending)} onClick={toggleArchive}>
                {fabric.isActive ? <Archive size={16} /> : <RotateCcw size={16} />}
                {pending === "archive" ? "Сохраняем…" : fabric.isActive ? "Архивировать" : "Вернуть из архива"}
              </Button>
            )}
            {can(user.role, "fabric:delete") && (
              <Button variant="danger" disabled={Boolean(pending)} onClick={deleteFabric}>
                <Trash2 size={16} />
                {pending === "delete" ? "Удаляем…" : "Удалить"}
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs" style={{ color: "rgba(245,241,233,.4)" }}>Обновлено {formatDate(fabric.updatedAt)}</p>
        </div>
      </div>

      {texture && (
        <ImageLightbox
          open={lightboxOpen}
          src={texture.url}
          alt={texture.originalFilename}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
