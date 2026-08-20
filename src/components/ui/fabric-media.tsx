/* eslint-disable @next/next/no-img-element -- authenticated fabric assets render directly */
"use client";

import type { Fabric } from "@/types/domain";
import { fabricPhoto } from "@/lib/fabric-visual";
import { cn } from "@/lib/utils";

type FabricMediaProps = {
  fabric: Pick<Fabric, "swatch" | "assets">;
  className?: string;
  aspect?: string;
  priority?: boolean;
};

export function FabricMedia({ fabric, className, aspect = "aspect-[4/5]", priority }: FabricMediaProps) {
  const photo = fabricPhoto(fabric);
  return (
    <div className={cn("material-frame overflow-hidden", aspect, className)}>
      {photo ? (
        <img
          src={photo.url}
          alt=""
          className="material-image h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className={cn("fabric-swatch fabric-swatch-rich h-full w-full", fabric.swatch)} />
      )}
    </div>
  );
}
