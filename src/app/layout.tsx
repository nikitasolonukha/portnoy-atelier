import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Портной", template: "%s — Портной" },
  description: "Рабочее пространство ателье: ткани и конфигурации костюмов.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
