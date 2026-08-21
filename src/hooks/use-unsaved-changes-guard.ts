"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function resolveInternalHref(anchor: HTMLAnchorElement): string | null {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return null;
  let url: URL;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useUnsavedChangesGuard(dirty: boolean) {
  const router = useRouter();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveHref, setLeaveHref] = useState("/fabrics");
  const bypassRef = useRef(false);

  const allowNextNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  const requestLeave = useCallback((href: string) => {
    if (!dirty || bypassRef.current) {
      bypassRef.current = false;
      router.push(href);
      return;
    }
    setLeaveHref(href);
    setLeaveOpen(true);
  }, [dirty, router]);

  const stay = useCallback(() => {
    setLeaveOpen(false);
  }, []);

  const leaveWithoutSaving = useCallback(() => {
    bypassRef.current = true;
    setLeaveOpen(false);
    router.push(leaveHref);
  }, [leaveHref, router]);

  const navigateAfterSave = useCallback((href: string) => {
    bypassRef.current = true;
    setLeaveOpen(false);
    router.push(href);
  }, [router]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (bypassRef.current || isModifiedClick(event)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = resolveInternalHref(anchor);
      if (!href) return;
      event.preventDefault();
      setLeaveHref(href);
      setLeaveOpen(true);
    };
    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onPopState = () => {
      if (bypassRef.current) return;
      const confirmed = window.confirm("Есть несохранённые изменения. Выйти без сохранения?");
      if (!confirmed) {
        history.go(1);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [dirty]);

  return {
    leaveOpen,
    leaveHref,
    requestLeave,
    stay,
    leaveWithoutSaving,
    allowNextNavigation,
    navigateAfterSave,
  };
}
