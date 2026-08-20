"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, LayoutDashboard, Menu, Settings2, SwatchBook, X } from "lucide-react";
import { CurrentUserProvider } from "@/features/auth/current-user-context";
import { LogoutButton } from "@/features/auth/logout-button";
import type { CurrentUser } from "@/types/auth";

const items = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/fabrics", label: "Ткани", icon: SwatchBook },
  { href: "/configurator", label: "Сборка", icon: Settings2 },
  { href: "/configurations", label: "Варианты", icon: Archive },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("ru")).join("") || "П";
}

export function AppShell({ children, user }: { children: React.ReactNode; user: CurrentUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const fullBleed = pathname.startsWith("/configurator") || pathname.startsWith("/fabrics");

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); openButton.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <CurrentUserProvider user={user}>
      <div className="app-grid">
        {open && (
          <button
            className="fixed inset-0 z-20 bg-black/35 md:hidden"
            aria-label="Закрыть меню"
            onClick={() => { setOpen(false); openButton.current?.focus(); }}
          />
        )}

        <aside id="primary-navigation" className="sidebar" data-open={open} aria-label="Основная навигация">
          <div className="flex w-full items-center justify-between px-4 md:justify-center md:px-0">
            <Link href="/dashboard" className="brand-mark" onClick={() => setOpen(false)} aria-label="Портной">
              П
            </Link>
            <button
              ref={closeButton}
              className="grid size-9 place-items-center text-white/60 hover:text-white md:hidden"
              aria-label="Закрыть меню"
              onClick={() => { setOpen(false); openButton.current?.focus(); }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <nav className="nav-rail" aria-label="Разделы">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-rail-link"
                aria-current={pathname.startsWith(href) ? "page" : undefined}
                data-active={pathname.startsWith(href)}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} strokeWidth={1.5} aria-hidden="true" className="nav-rail-icon" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-foot">
            <span className="micro-label mb-2 text-white/35" aria-hidden="true">{initials(user.fullName)}</span>
            <LogoutButton />
          </div>
        </aside>

        <main className="page-shell">
          <header className="mobile-bar">
            <button
              ref={openButton}
              className="mobile-bar__menu"
              aria-label="Открыть меню"
              aria-controls="primary-navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[--text-secondary]">Portnoy</p>
            <span className="mobile-bar__user" aria-label={user.fullName}>
              {initials(user.fullName)}
            </span>
          </header>
          <div className={fullBleed ? "page-content page-content--flush fade-in" : "page-content fade-in"}>
            {children}
          </div>
        </main>
      </div>
    </CurrentUserProvider>
  );
}
