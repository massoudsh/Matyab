"use client";

import { useEffect, useState } from "react";
import { clearToken, isLoggedIn } from "@/lib/auth";

export function AuthNav() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  if (loggedIn) {
    return (
      <button
        onClick={() => {
          clearToken();
          setLoggedIn(false);
          window.location.href = "/";
        }}
        className="text-sm text-gray-600 hover:text-brand-dark"
      >
        خروج
      </button>
    );
  }

  return (
    <div className="flex gap-3 text-sm">
      <a href="/login" className="text-gray-600 hover:text-brand-dark">
        ورود
      </a>
      <a href="/register" className="rounded-lg bg-brand px-3 py-1.5 text-white hover:bg-brand-dark">
        ثبت‌نام
      </a>
    </div>
  );
}
