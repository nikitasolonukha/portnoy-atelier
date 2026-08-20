/* eslint-disable @next/next/no-img-element */
"use client";

import { Layers } from "lucide-react";
import type { Fabric } from "@/types/domain";
import { fabricPhoto, fabricTexture } from "@/lib/fabric-visual";

type MaterialStageProps = {
  fabric?: Pick<Fabric, "article" | "name" | "manufacturer" | "composition" | "swatch" | "assets" | "weightGsm" | "pricePerMeter"> | null;
  settings?: Record<string, string>;
  stepLabel?: string;
  constructionLabel?: string;
};

export function MaterialStage({ fabric, settings = {}, stepLabel, constructionLabel }: MaterialStageProps) {
  const photo = fabric ? fabricPhoto(fabric) : undefined;
  const texture = fabric ? fabricTexture(fabric) : undefined;
  const visual = photo?.url ?? texture?.url;

  const isDoubleBreasted = settings.jacket === "double";
  const lapelType = settings.lapel || "notch";
  const pocketType = settings.pockets || "flap";

  return (
    <div className="material-stage" aria-label="Превью материала">
      <div className="material-stage__grid" aria-hidden="true" />
      {visual ? (
        <img src={visual} alt="" className="material-stage__texture" />
      ) : (
        <div className={cnSwatch(fabric?.swatch)} />
      )}
      <div className="material-stage__vignette" aria-hidden="true" />
      <svg className="material-stage__outline" viewBox="0 0 320 400" aria-hidden="true">
        <path
          d={
            isDoubleBreasted
              ? "M75 55 L125 70 L160 115 L195 70 L245 55 L260 150 L235 290 L85 290 L60 150 Z"
              : "M80 55 L130 68 L160 120 L190 68 L240 55 L255 150 L230 290 L90 290 L65 150 Z"
          }
          fill="rgba(42, 45, 42, 0.55)"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <path
          d="M100 80 L160 145 L220 80 L205 240 L115 240 Z"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="3 3"
          opacity="0.35"
        />
        {lapelType === "peak" ? (
          <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.75">
            <path d="M125 70 L105 130 L160 190 L135 150 L125 70" fill="rgba(60,64,60,0.35)" />
            <path d="M195 70 L215 130 L160 190 L185 150 L195 70" fill="rgba(60,64,60,0.35)" />
          </g>
        ) : lapelType === "shawl" ? (
          <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.75">
            <path d="M125 70 Q110 140 160 200 L160 70 Z" fill="rgba(60,64,60,0.3)" />
            <path d="M195 70 Q210 140 160 200 L160 70 Z" fill="rgba(60,64,60,0.3)" />
          </g>
        ) : (
          <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.75">
            <path d="M125 70 L115 135 L128 140 L118 165 L160 195 L140 140 Z" fill="rgba(60,64,60,0.35)" />
            <path d="M195 70 L205 135 L192 140 L202 165 L160 195 L180 140 Z" fill="rgba(60,64,60,0.35)" />
          </g>
        )}
        <path d="M102 145 L132 142 L131 150 L101 153 Z" stroke="currentColor" strokeWidth="1.1" fill="rgba(255,255,255,0.06)" opacity="0.6" />
        {pocketType === "patch" ? (
          <g stroke="currentColor" strokeWidth="1.1" opacity="0.55">
            <rect x="90" y="210" width="38" height="42" rx="4" fill="rgba(255,255,255,0.04)" />
            <rect x="192" y="210" width="38" height="42" rx="4" fill="rgba(255,255,255,0.04)" />
          </g>
        ) : pocketType === "jetted" ? (
          <g stroke="currentColor" strokeWidth="1.1" opacity="0.55">
            <line x1="90" y1="225" x2="128" y2="225" />
            <line x1="192" y1="225" x2="230" y2="225" />
          </g>
        ) : (
          <g stroke="currentColor" strokeWidth="1.1" opacity="0.55">
            <path d="M88 220 L130 220 L128 232 L90 232 Z" fill="rgba(255,255,255,0.06)" />
            <path d="M190 220 L232 220 L230 232 L192 232 Z" fill="rgba(255,255,255,0.06)" />
          </g>
        )}
        {isDoubleBreasted ? (
          <g fill="currentColor" stroke="rgba(0,0,0,0.4)" strokeWidth="0.75" opacity="0.7">
            <circle cx="145" cy="180" r="3.5" />
            <circle cx="175" cy="180" r="3.5" />
            <circle cx="145" cy="210" r="3.5" />
            <circle cx="175" cy="210" r="3.5" />
            <circle cx="145" cy="240" r="3.5" />
            <circle cx="175" cy="240" r="3.5" />
          </g>
        ) : (
          <g fill="currentColor" stroke="rgba(0,0,0,0.4)" strokeWidth="0.75" opacity="0.7">
            <circle cx="160" cy="205" r="3.5" />
            <circle cx="160" cy="235" r="3.5" />
          </g>
        )}
        <path
          d="M105 290 L100 380 L135 380 L155 315 L165 315 L185 380 L220 380 L215 290 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="rgba(42, 45, 42, 0.4)"
          opacity="0.7"
        />
      </svg>
      <div className="material-stage__corner material-stage__corner--tl">
        <span className="micro-label">Material</span>
        <span className="material-stage__value">{fabric?.article ?? "—"}</span>
      </div>
      <div className="material-stage__corner material-stage__corner--tr">
        <span className="micro-label">Stage</span>
        <span className="material-stage__value">{stepLabel ?? "Fabric"}</span>
      </div>
      {constructionLabel && (
        <div className="material-stage__corner material-stage__corner--bl">
          <span className="micro-label">Construction</span>
          <span className="material-stage__value">{constructionLabel}</span>
        </div>
      )}
      {Object.keys(settings).length > 0 && (
        <div className="absolute right-4 top-[72px] z-[4] flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-white/10 bg-[rgba(32,34,32,.78)] px-2.5 py-1.5 backdrop-blur-[10px]">
          <Layers size={11} className="text-[--accent]" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-white/70">
            {isDoubleBreasted ? "DB" : "SB"} · {lapelType} · {pocketType}
          </span>
        </div>
      )}
      <div className="material-stage__footer">
        <p className="font-display text-2xl tracking-[-0.01em]">{fabric?.name ?? "Ткань не выбрана"}</p>
        <p className="mt-1 text-xs font-medium text-white/55">
          {fabric
            ? `${fabric.manufacturer || "—"} · ${fabric.composition || "—"}${fabric.weightGsm ? ` · ${fabric.weightGsm} г/м²` : ""}`
            : "Выберите материал на первом шаге"}
        </p>
      </div>
    </div>
  );
}

function cnSwatch(swatch?: string) {
  return `material-stage__fallback fabric-swatch fabric-swatch-rich ${swatch ?? "charcoal"}`;
}
