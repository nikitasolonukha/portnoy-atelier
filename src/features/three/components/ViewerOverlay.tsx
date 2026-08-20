import React from "react";
import {
  Rotate3d,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import type { CameraPresetKey, SuitVisualState } from "../model/suit-model-types";
import type { Fabric } from "@/types/domain";

interface ViewerOverlayProps {
  fabric?: Fabric | null;
  visualState: SuitVisualState;
  activePreset: CameraPresetKey;
  onSelectPreset: (key: CameraPresetKey) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetCamera: () => void;
}

const presets: Array<{ key: CameraPresetKey; label: string }> = [
  { key: "three-quarters", label: "3/4" },
  { key: "front", label: "Спереди" },
  { key: "side", label: "Сбоку" },
  { key: "back", label: "Спина" },
  { key: "close-lapel", label: "Борт" },
];

export function ViewerOverlay({
  fabric,
  activePreset,
  onSelectPreset,
  autoRotate,
  onToggleAutoRotate,
  isFullscreen,
  onToggleFullscreen,
  onResetCamera,
}: ViewerOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 select-none sm:p-3.5">
      <div className="pointer-events-auto flex items-start justify-between gap-3">
        <div className="flex max-w-[70%] items-center gap-2 rounded-[10px] border border-white/10 bg-[var(--graphite)]/90 px-3 py-1.5 text-white shadow-md backdrop-blur-md">
          <span className="size-2 shrink-0 rounded-full bg-emerald-400" />
          <span className="font-mono text-[10px] font-bold text-white/90">
            {fabric?.article || "ART-001"}
          </span>
          <span className="truncate text-[11px] font-medium text-white/80">
            {fabric?.name || "Костюмная шерсть"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAutoRotate}
            className={`flex size-8 items-center justify-center rounded-[9px] border transition-all ${
              autoRotate
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-white/10 bg-[var(--graphite)]/85 text-white/80 hover:text-white"
            }`}
            title={autoRotate ? "Остановить вращение" : "Вращение 360°"}
          >
            <Rotate3d size={14} />
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex size-8 items-center justify-center rounded-[9px] border border-white/10 bg-[var(--graphite)]/85 text-white/80 transition-all hover:text-white"
            title={isFullscreen ? "Свернуть" : "На весь экран"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Camera presets — single clean cluster, bottom-left */}
      <div className="pointer-events-auto self-start">
        <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[10px] border border-white/10 bg-[var(--graphite)]/92 p-1 shadow-lg backdrop-blur-md">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => onSelectPreset(preset.key)}
              className={`rounded-[7px] px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                activePreset === preset.key
                  ? "bg-white/20 font-semibold text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onResetCamera}
            className="rounded-[6px] p-1.5 text-white/45 transition-colors hover:text-white"
            title="Сброс камеры"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
