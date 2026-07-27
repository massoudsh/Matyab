"use client";

import { useEffect, useState } from "react";
import { api, Supplier, SupplierComparisonEntry } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { flattenCategories } from "@/lib/categories";

export default function SuppliersPage() {
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // فرم ثبت تأمین‌کننده‌ی جدید
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState<string | null>(null);

  // فرم ثبت قیمت پیشنهادی
  const [quoteSupplierId, setQuoteSupplierId] = useState("");
  const [quoteCategoryId, setQuoteCategoryId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // مقایسه‌ی تأمین‌کننده‌ها بر اساس دسته
  const [compareCategoryId, setCompareCategoryId] = useState("");
  const [comparison, setComparison] = useState<SupplierComparisonEntry[]>([]);
  const [comparing, setComparing] = useState(false);

  async function loadSuppliers() {
    const list = await api.getSuppliers();
    setSuppliers(list);
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    Promise.all([api.getCategories(), api.getSuppliers()])
      .then(([c, s]) => {
        setCategories(flattenCategories(c));
        setSuppliers(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری اطلاعات"))
      .finally(() => setLoaded(true));
  }, []);

  async function onCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    setSupplierError(null);
    setSupplierLoading(true);
    try {
      await api.createSupplier({ name, phone: phone || undefined, city: city || undefined });
      setName("");
      setPhone("");
      setCity("");
      await loadSuppliers();
    } catch (err) {
      setSupplierError(err instanceof Error ? err.message : "خطا در ثبت تأمین‌کننده");
    } finally {
      setSupplierLoading(false);
    }
  }

  async function onCreateQuote(e: React.FormEvent) {
    e.preventDefault();
    setQuoteError(null);
    setQuoteLoading(true);
    try {
      await api.createSupplierQuote(quoteSupplierId, {
        categoryId: quoteCategoryId,
        unitPrice: Number(unitPrice),
        leadTimeDays: Number(leadTimeDays),
      });
      setUnitPrice("");
      setLeadTimeDays("");
      await loadSuppliers();
      if (compareCategoryId === quoteCategoryId) await runCompare(quoteCategoryId);
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "خطا در ثبت قیمت پیشنهادی");
    } finally {
      setQuoteLoading(false);
    }
  }

  async function runCompare(categoryId: string) {
    setCompareCategoryId(categoryId);
    if (!categoryId) {
      setComparison([]);
      return;
    }
    setComparing(true);
    try {
      const result = await api.compareSuppliers(categoryId);
      setComparison(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در مقایسه‌ی تأمین‌کننده‌ها");
    } finally {
      setComparing(false);
    }
  }

  if (!loaded) return <p className="text-gray-500">در حال بارگذاری...</p>;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">تأمین‌کنندگان و مقایسه</h1>
      <p className="mb-6 text-sm text-gray-500">
        تأمین‌کننده و قیمت/زمان تحویل هر دسته را ثبت کنید تا کوپایلوت تأمین بتواند بهترین گزینه را پیشنهاد بدهد.
      </p>
      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 font-semibold">ثبت تأمین‌کننده‌ی جدید</h2>
          <form onSubmit={onCreateSupplier} className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام تأمین‌کننده"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="شماره تماس (اختیاری)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="شهر (اختیاری)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            {supplierError && <p className="text-sm text-rose-600">{supplierError}</p>}
            <button
              type="submit"
              disabled={supplierLoading}
              className="w-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {supplierLoading ? "در حال ثبت..." : "ثبت تأمین‌کننده"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 font-semibold">ثبت قیمت پیشنهادی برای یک دسته</h2>
          {suppliers.length === 0 ? (
            <p className="text-sm text-gray-500">ابتدا یک تأمین‌کننده ثبت کنید.</p>
          ) : (
            <form onSubmit={onCreateQuote} className="space-y-3">
              <select
                value={quoteSupplierId}
                onChange={(e) => setQuoteSupplierId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">تأمین‌کننده را انتخاب کنید</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.city ? `— ${s.city}` : ""}
                  </option>
                ))}
              </select>
              <select
                value={quoteCategoryId}
                onChange={(e) => setQuoteCategoryId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">دسته‌ی مصالح را انتخاب کنید</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="قیمت واحد (تومان)"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
                <input
                  type="number"
                  min={0}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  placeholder="زمان تحویل (روز)"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              {quoteError && <p className="text-sm text-rose-600">{quoteError}</p>}
              <button
                type="submit"
                disabled={quoteLoading}
                className="w-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {quoteLoading ? "در حال ثبت..." : "ثبت قیمت پیشنهادی"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <h2 className="mb-3 font-semibold">مقایسه‌ی تأمین‌کنندگان یک دسته</h2>
        <select
          value={compareCategoryId}
          onChange={(e) => runCompare(e.target.value)}
          className="mb-4 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">دسته‌ی مصالح را انتخاب کنید</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        {comparing ? (
          <p className="text-gray-500">در حال مقایسه...</p>
        ) : compareCategoryId === "" ? (
          <p className="text-sm text-gray-500">یک دسته انتخاب کنید تا تأمین‌کنندگان آن مقایسه شوند.</p>
        ) : comparison.length === 0 ? (
          <p className="text-sm text-gray-500">برای این دسته هنوز قیمت پیشنهادی ثبت نشده.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-right text-gray-500">
                  <th className="py-2">تأمین‌کننده</th>
                  <th className="py-2">قیمت واحد</th>
                  <th className="py-2">زمان تحویل</th>
                  <th className="py-2">تحویل به‌موقع</th>
                  <th className="py-2">میانگین تأخیر</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((c, i) => (
                  <tr key={c.quoteId} className={`border-b border-gray-100 ${i === 0 ? "bg-brand/5" : ""}`}>
                    <td className="py-2">
                      {c.supplierName} {c.city ? `— ${c.city}` : ""} {i === 0 && <span className="text-brand-dark">(ارزان‌ترین)</span>}
                    </td>
                    <td className="py-2">{c.unitPrice.toLocaleString("fa-IR")} تومان</td>
                    <td className="py-2">{c.leadTimeDays} روز</td>
                    <td className="py-2">{c.onTimeRate != null ? `${Math.round(c.onTimeRate * 100)}٪ (از ${c.sampleSize} سفارش)` : "بدون سابقه"}</td>
                    <td className="py-2">{c.avgDelayDays != null && c.avgDelayDays > 0 ? `${c.avgDelayDays} روز` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
