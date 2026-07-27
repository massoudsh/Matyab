"use client";

import { useEffect, useState } from "react";
import { api, Listing, MaterialRequest, Project, User } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface ProjectSummary extends Project {
  listings: Listing[];
  requests: MaterialRequest[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }

    async function load() {
      const [me, myProjects] = await Promise.all([api.me(), api.getMyProjects()]);
      setUser(me);

      const summaries = await Promise.all(
        myProjects.map(async (p) => {
          const [listings, requests] = await Promise.all([
            api.getListings({ projectId: p.id }),
            api.getRequests({ projectId: p.id }),
          ]);
          return { ...p, listings, requests };
        })
      );
      setProjects(summaries);
    }

    load()
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری داشبورد"))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <p className="text-gray-500">در حال بارگذاری...</p>;
  if (error) return <p className="text-rose-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">داشبورد</h1>
      {user && (
        <p className="mb-6 text-sm text-gray-500">
          خوش آمدید {user.fullName} ({user.role === "SUPPLIER" ? "تأمین‌کننده" : user.role === "ADMIN" ? "ادمین" : "پیمانکار"})
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <a href="/projects/new" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
          پروژه جدید
        </a>
        <a href="/listings/new" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
          آگهی جدید
        </a>
        <a href="/requests/new" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
          درخواست جدید
        </a>
        {user?.role === "ADMIN" && (
          <a href="/admin/listings" className="rounded-lg border border-brand px-3 py-1.5 text-sm text-brand-dark hover:bg-brand/5">
            پنل ادمین
          </a>
        )}
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500">
          هنوز پروژه‌ای ثبت نکرده‌اید. <a href="/projects/new" className="text-brand-dark underline">یک پروژه بسازید</a>.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold">
                {p.name} <span className="text-sm font-normal text-gray-500">— {p.city}</span>
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {p.listings.length} آگهی فعال · {p.requests.length} درخواست فعال
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
