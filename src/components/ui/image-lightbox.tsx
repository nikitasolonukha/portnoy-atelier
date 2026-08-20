"use client";

import { useEffect, useId, useRef } from "react";

export function ImageLightbox({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(25,27,25,.82)] p-4" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onClose}>
      <div className="relative max-h-[90dvh] w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <p id={titleId} className="sr-only">{alt}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-[90dvh] w-full object-contain" />
        <button
          ref={closeRef}
          type="button"
          className="absolute right-2 top-2 grid min-h-11 min-w-11 place-items-center rounded-[10px] bg-[rgba(25,27,25,.9)] px-3 text-sm font-semibold text-[var(--ink-inverse)]"
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
