"use client";

import { useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    api.getMyProjects().then(setProjects).catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری پروژه‌ها");
    }).finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <p role="status" className="text-gray-500">در حال بارگذاری پروژه‌ها...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">پروژه‌های من</h1>
          <p className="mt-1 text-sm text-gray-500">پروژه را انتخاب کنید و آگهی یا درخواست مصالح ثبت کنید.</p>
        </div>
        <a href="/projects/new" className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-dark">پروژه جدید</a>
      </div>
      {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-600">
          هنوز پروژه‌ای ثبت نشده است. <a href="/projects/new" className="text-brand-dark underline">اولین پروژه را بسازید</a>.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => <article key={project.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold">{project.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{project.city}{project.region ? `، ${project.region}` : ""}</p>
            <div className="mt-4 flex gap-3 text-sm">
              <a className="text-brand-dark underline" href={`/listings/new?projectId=${project.id}`}>ثبت آگهی</a>
              <a className="text-brand-dark underline" href={`/requests/new?projectId=${project.id}`}>ثبت درخواست</a>
            </div>
          </article>)}
        </div>
      )}
    </div>
  );
}
