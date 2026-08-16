"use client";

import { useEffect, useState } from "react";
import { api, Notification } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

function fa(dateStr: string) {
  return new Date(dateStr).toLocaleString("fa-IR");
}

function notificationHref(n: Notification): string | null {
  if (n.refType === "material_request") return "/requests";
  if (n.refType === "boq_item") return "/procurement";
  return null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    api
      .getNotifications()
      .then(setNotifications)
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری اعلان‌ها"))
      .finally(() => setLoaded(true));
  }, []);

  async function markRead(id: string) {
    await api.markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  async function markAllRead() {
    await api.markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  if (!loaded) return <p className="text-gray-500">در حال بارگذاری...</p>;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-xl font-bold">اعلان‌ها</h1>
          <p className="text-sm text-gray-500">
            وقتی مصالح مورد نیاز شما پیدا شود یا یک قلم تأمین وارد وضعیت بحرانی شود، اینجا اطلاع می‌دهیم.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            علامت‌گذاری همه به‌عنوان خوانده‌شده
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      {notifications.length === 0 ? (
        <p className="text-gray-500">اعلانی وجود ندارد.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const href = notificationHref(n);
            return (
              <div
                key={n.id}
                className={`rounded-xl border p-4 ${n.isRead ? "border-gray-200" : "border-brand bg-brand/5"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    {n.body && <p className="mt-1 text-sm text-gray-600">{n.body}</p>}
                    <p className="mt-1 text-xs text-gray-400">{fa(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {href && (
                      <a href={href} className="text-sm text-brand-dark underline">
                        مشاهده
                      </a>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-sm text-gray-500 hover:text-brand-dark"
                      >
                        خوانده شد
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
