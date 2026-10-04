"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { flattenCategories } from "@/lib/categories";

export default function NewRequestPage() {
  const searchParams = useSearchParams();
  const preferredProjectId = searchParams.get("projectId");
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
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
        if (p.length > 0) setProjectId(p.some((project) => project.id === preferredProjectId) ? preferredProjectId! : p[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری اطلاعات"))
      .finally(() => setLoaded(true));
  }, [preferredProjectId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.createRequest({
        projectId,
        categoryId,
        quantity: Number(quantity),
        budget: budget ? Number(budget) : undefined,
        deadline: deadline || undefined,
      });
      window.location.href = "/requests";
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت درخواست");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return <p className="text-gray-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold">ثبت درخواست تقاضای مصالح</h1>
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
          <div>
            <label className="mb-1 block text-sm text-gray-600">مقدار مورد نیاز</label>
            <input
              type="number"
              min={0.01}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">بودجه (تومان، اختیاری)</label>
            <input
              type="number"
              min={0.01}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">مهلت (اختیاری)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت درخواست"}
          </button>
        </form>
      )}
    </div>
  );
}
