import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthNav } from "@/components/AuthNav";
import { NotificationBell } from "@/components/NotificationBell";

export const metadata: Metadata = {
  title: "متریاب — بازار هوشمند مصالح ساختمانی",
  description:
    "کوپایلوت هوشمند تأمین، قیمت‌گذاری و استفاده‌ی مجدد از مصالح ساختمانی در ایران.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-bold text-brand-dark">
              متریاب
            </a>
            <nav aria-label="ناوبری اصلی" className="flex flex-wrap items-center justify-end gap-3 text-sm text-gray-600">
              <a href="/projects">پروژه‌ها</a>
              <a href="/listings">آگهی‌های عرضه</a>
              <a href="/requests">درخواست‌های تقاضا</a>
              <a href="/matches">تطابق‌ها</a>
              <a href="/procurement">کوپایلوت تأمین</a>
              <a href="/dashboard">داشبورد</a>
              <NotificationBell />
              <AuthNav />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          متریاب — کوپایلوت هوشمند مصالح ساختمانی
        </footer>
      </body>
    </html>
  );
}
