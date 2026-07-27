"use client";

import { useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { flattenCategories } from "@/lib/categories";

export default function NewBoqItemPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [requiredQuantity, setRequiredQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    Promise.all([api.getMyProjects(), api.getCategories()])
      .then(([p, c]) => {
        setProjects(p);
        setCategories(flattenCategories(c));
        const preset = new URLSearchParams(window.location.search).get("projectId");
        setProjectId(preset && p.some((x) => x.id === preset) ? preset : p[0]?.id ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری اطلاعات"))
      .finally(() => setLoaded(true));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.createBoqItem({
        projectId,
        categoryId,
        requiredQuantity: Number(requiredQuantity),
        unit,
        neededBy,
      });
      window.location.href = "/procurement";
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت قلم BOQ");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return <p className="text-gray-500">در حال بارگذاری...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-bold">افزودن قلم BOQ</h1>
      <p className="mb-4 text-sm text-gray-500">
        این مصالح تا چه تاریخی در کارگاه لازم است؟ کوپایلوت بر اساس زمان تحویل تأمین‌کننده‌ها مهلت سفارش را محاسبه می‌کند.
      </p>
      {projects.length === 0 ? (
        <p className="text-gray-600">
          ابتدا باید یک پروژه ثبت کنید.{" "}
          <a href="/projects/new" className="text-brand-dark underline">
            ساخت پروژه‌ی جدید
          </a>
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">پروژه</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">دسته‌ی مصالح</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">انتخاب کنید</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">مقدار مورد نیاز</label>
              <input
                type="number"
                min={0}
                step="any"
                value={requiredQuantity}
                onChange={(e) => setRequiredQuantity(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">واحد</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="تن، متر مربع، ..."
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">تاریخ نیاز در کارگاه</label>
            <input
              type="date"
              value={neededBy}
              onChange={(e) => setNeededBy(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت قلم BOQ"}
          </button>
        </form>
      )}
    </div>
  );
}
