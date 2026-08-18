import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  const isSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";
  return <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,.9fr)]">
    <section className="relative hidden overflow-hidden bg-[#202421] p-12 text-[#f4f0e8] lg:flex lg:flex-col lg:justify-between" aria-label="О продукте">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(125deg,transparent 0 12px,rgba(255,255,255,.08) 12px 13px)" }} />
      <div className="relative flex items-center gap-3"><span className="brand-mark">П</span><span className="font-display text-2xl">Портной</span></div>
      <div className="relative max-w-xl"><p className="eyebrow text-[#d599a3]">Рабочее пространство ателье</p><h1 className="font-display mt-5 text-6xl font-normal leading-[1.02]">От первого образца ткани до готовой конфигурации.</h1><p className="mt-7 max-w-lg text-base leading-7 text-[#bfc1bb]">Каталог материалов и системная сборка костюма — в одном спокойном рабочем процессе.</p></div>
      <p className="relative text-xs text-[#92968f]">{isSupabase ? "Защищённая рабочая среда" : "Stage 1 · локальная демонстрационная среда"}</p>
    </section>
    <section className="flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-12 flex items-center gap-3 lg:hidden"><span className="brand-mark border-[#73776f] text-black">П</span><span className="font-display text-2xl">Портной</span></div>
        <p className="eyebrow">С возвращением</p><h2 className="font-display mt-3 text-4xl font-normal">Вход в ателье</h2><p className="muted mt-3 text-sm leading-6">{isSupabase ? "Введите учётные данные рабочего пространства." : "Используйте демонстрационный доступ. Для боевого режима укажите Supabase-переменные окружения."}</p>
        <LoginForm />
      </div>
    </section>
  </main>;
}
