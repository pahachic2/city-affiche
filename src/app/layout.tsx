import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "City Affiche - Афиша городских мероприятий",
  description: "Лучшие мероприятия вашего города: концерты, театр, выставки, спорт и многое другое",
  keywords: "мероприятия, афиша, события, концерты, театр, выставки, город",
  authors: [{ name: "City Affiche Team" }],
  // Open Graph для соцсетей
  openGraph: {
    title: "City Affiche - Афиша городских мероприятий",
    description: "Лучшие мероприятия вашего города",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* Основной контейнер с адаптивными отступами */}
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
