"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { flattenCategories } from "@/lib/categories";

export default function NewListingPage() {
  const searchParams = useSearchParams();
  const preferredProjectId = searchParams.get("projectId");
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("تن");
  const [askingPrice, setAskingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
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
      await api.createListing({
        projectId,
        categoryId,
        quantity: Number(quantity),
        unit,
        askingPrice: Number(askingPrice),
        description: description || undefined,
        photos: photoUrl ? [photoUrl] : [],
      });
      window.location.href = "/listings";
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت آگهی");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return <p className="text-gray-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold">ثبت آگهی عرضه‌ی مصالح</h1>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">مقدار</label>
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
              <label className="mb-1 block text-sm text-gray-600">واحد</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="تن / متر / عدد"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">قیمت پیشنهادی (تومان)</label>
            <input
              type="number"
              min={0.01}
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">آدرس عکس (اختیاری)</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">توضیحات (اختیاری)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت آگهی"}
          </button>
          <p className="text-xs text-gray-400">
            آگهی پس از تأیید ادمین در فهرست عمومی نمایش داده می‌شود.
          </p>
        </form>
      )}
      {error && projects.length === 0 && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
