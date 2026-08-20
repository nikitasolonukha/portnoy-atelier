import React from "react";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import type { Fabric } from "@/types/domain";

interface ViewerFallbackProps {
  fabric?: Fabric | null;
  error?: string | null;
  onRetry?: () => void;
}

export function ViewerFallback({ fabric, error, onRetry }: ViewerFallbackProps) {
  return (
    <div className="w-full h-full min-h-[480px] rounded-[16px] bg-[var(--graphite)] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden border border-white/10">
      {/* Background fabric swatch glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className={`w-full h-full ${fabric?.swatch || "navy-weave"}`} />
      </div>

      <div className="relative z-10 max-w-sm space-y-3">
        <div className="size-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-amber-300">
          {error ? <AlertCircle size={24} /> : <Sparkles size={24} className="animate-spin" />}
        </div>

        <h3 className="font-display text-xl font-normal">
          {error ? "Режим 3D временно недоступен" : "Инициализация 3D сцены…"}
        </h3>

        <p className="text-xs font-ui text-white/60 leading-relaxed">
          {error
            ? error
            : "Загрузка физических материалов, шейдеров и студийного освещения"}
        </p>

        {error && onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 rounded-[9px] bg-[var(--accent)] text-white text-xs font-ui font-medium inline-flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Повторить попытку</span>
          </button>
        )}
      </div>
    </div>
  );
}
