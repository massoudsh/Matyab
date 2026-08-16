"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

/** آیکن زنگوله‌ی اعلان با شمارنده‌ی خوانده‌نشده — E14. */
export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const logged = isLoggedIn();
    setLoggedIn(logged);
    if (!logged) return;

    let cancelled = false;
    function load() {
      api
        .getUnreadNotificationCount()
        .then((r) => {
          if (!cancelled) setCount(r.count);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!loggedIn) return null;

  return (
    <a href="/notifications" className="relative text-gray-600 hover:text-brand-dark" title="اعلان‌ها">
      اعلان‌ها
      {count > 0 && (
        <span className="absolute -top-2 -right-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] text-white">
          {count > 9 ? "۹+" : count}
        </span>
      )}
    </a>
  );
}
