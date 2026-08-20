"use client";

import dynamic from "next/dynamic";
import type { Fabric } from "@/types/domain";
import { ViewerFallback } from "@/features/three/components/ViewerFallback";
import { Suit3DErrorBoundary } from "@/features/configurator/suit-3d-error-boundary";

const Suit3DViewer = dynamic(
  () => import("@/features/three/components/Suit3DViewer").then((mod) => mod.Suit3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="material-stage">
        <ViewerFallback />
      </div>
    ),
  },
);

type Suit3DStageProps = {
  fabric?: Fabric | null;
  settings?: Record<string, string>;
  className?: string;
};

export function Suit3DStage({ fabric, settings, className }: Suit3DStageProps) {
  return (
    <Suit3DErrorBoundary fabric={fabric}>
      <Suit3DViewer fabric={fabric} settings={settings} className={className} />
    </Suit3DErrorBoundary>
  );
}
