"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ChevronDown, LayoutDashboard, Menu, Scissors, Settings2, SwatchBook, X } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/fabrics", label: "Ткани", icon: SwatchBook },
  { href: "/configurator", label: "Конфигуратор", icon: Settings2 },
  { href: "/configurations", label: "Конфигурации", icon: Archive },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="app-grid">
    {open && <button className="fixed inset-0 z-20 bg-black/35 lg:hidden" aria-label="Закрыть меню" onClick={() => setOpen(false)} />}
    <aside className="sidebar" data-open={open} aria-label="Основная навигация">
      <div className="mb-9 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 text-white no-underline" onClick={() => setOpen(false)}>
          <span className="brand-mark">П</span><span><b className="font-display text-xl font-normal">Портной</b><small className="block text-[10px] uppercase tracking-[.16em] text-[#aeb1aa]">atelier workspace</small></span>
        </Link>
        <button className="icon-button border-[#555b56] text-white lg:hidden" aria-label="Закрыть меню" onClick={() => setOpen(false)}><X size={20} /></button>
      </div>
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="nav-link" data-active={pathname.startsWith(href)} onClick={() => setOpen(false)}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
      </nav>
      <div className="mt-auto border-t border-[#3b413c] pt-5">
        <div className="mb-4 flex items-center gap-2 px-3 text-xs text-[#b8b9b4]"><span className="status-dot" /> {process.env.NEXT_PUBLIC_APP_MODE === "supabase" ? "Supabase подключён" : "Демо-база активна"}</div>
        <Link href="/login" className="nav-link"><Scissors size={18} aria-hidden="true" /><span>Выйти</span></Link>
      </div>
    </aside>
    <main className="page-shell">
      <header className="topbar">
        <div className="flex items-center gap-3">
          <button className="icon-button lg:hidden" aria-label="Открыть меню" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <p className="hidden text-sm font-bold sm:block">Рабочее пространство ателье</p>
        </div>
        <button className="button button-quiet" aria-label="Открыть меню пользователя"><span className="grid size-8 place-items-center bg-[#d9d0c2] font-serif">НС</span><span className="hidden sm:inline">Никита Солонуха</span><ChevronDown size={15} aria-hidden="true" /></button>
      </header>
      <div className="page-content">{children}</div>
    </main>
  </div>;
}
