import type { Metadata } from "next";
import { Prata, Manrope } from "next/font/google";
import "./globals.css";

const display = Prata({
  subsets: ["cyrillic", "latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Портной", template: "%s — Портной" },
  description: "Рабочее пространство ателье: ткани и конфигурации костюмов.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
