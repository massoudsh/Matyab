"use client";

import { useEffect, useState } from "react";
import { api, Project, ProcurementRiskReportItem } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { ProcurementStatusBadge } from "@/components/ProcurementStatusBadge";
import { PriceRiskBadge } from "@/components/PriceRiskBadge";

function fa(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fa-IR");
}

export default function ProcurementCopilotPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [report, setReport] = useState<ProcurementRiskReportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    api
      .getMyProjects()
      .then((p) => {
        setProjects(p);
        if (p.length > 0) setProjectId(p[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری پروژه‌ها"))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoadingReport(true);
    api
      .getProcurementRiskReport(projectId)
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری گزارش ریسک تأمین"))
      .finally(() => setLoadingReport(false));
  }, [projectId]);

  if (!loaded) return <p className="text-gray-500">در حال بارگذاری...</p>;

  const criticalCount = report.filter((r) => r.status === "CRITICAL").length;
  const watchCount = report.filter((r) => r.status === "WATCH").length;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">کوپایلوت تأمین و زنجیره‌ی تأمین</h1>
      <p className="mb-6 text-sm text-gray-500">
        پیش‌بینی نیاز مصالح ۴ تا ۸ هفته‌ی آینده، ریسک قیمت و مقایسه‌ی تأمین‌کننده برای هر پروژه.
      </p>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      {projects.length === 0 ? (
        <p className="text-gray-500">
          ابتدا باید یک پروژه ثبت کنید.{" "}
          <a href="/projects/new" className="text-brand-dark underline">
            ساخت پروژه‌ی جدید
          </a>
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">پروژه</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <a
                href={`/procurement/boq/new?projectId=${projectId}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                افزودن قلم BOQ
              </a>
              <a
                href="/procurement/suppliers"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                تأمین‌کننده‌ها و مقایسه
              </a>
            </div>
          </div>

          {(criticalCount > 0 || watchCount > 0) && (
            <div className="mb-4 flex gap-3 text-sm">
              {criticalCount > 0 && (
                <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700">
                  {criticalCount} قلم بحرانی — نیاز به سفارش فوری
                </span>
              )}
              {watchCount > 0 && (
                <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
                  {watchCount} قلم در حال پایش (۲ تا ۸ هفته‌ی آینده)
                </span>
              )}
            </div>
          )}

          {loadingReport ? (
            <p className="text-gray-500">در حال محاسبه‌ی گزارش ریسک تأمین...</p>
          ) : report.length === 0 ? (
            <p className="text-gray-500">
              هنوز قلمی در BOQ این پروژه ثبت نشده.{" "}
              <a href={`/procurement/boq/new?projectId=${projectId}`} className="text-brand-dark underline">
                یک قلم اضافه کنید
              </a>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {report.map((r) => (
                <div key={r.boqItemId} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold">{r.categoryName}</h2>
                    <div className="flex flex-wrap gap-2">
                      <ProcurementStatusBadge status={r.status} />
                      <PriceRiskBadge level={r.priceRisk.level} changePct={r.priceRisk.changePct} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    نیاز: {r.requiredQuantity} {r.unit} · سفارش‌شده: {r.orderedQuantity} {r.unit} · باقی‌مانده:{" "}
                    {r.remainingQuantity} {r.unit}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    مهلت نیاز در کارگاه: {fa(r.neededBy)} · زمان تحویل تأمین‌کننده: حدود {r.leadTimeDays} روز · باید تا{" "}
                    {fa(r.mustOrderBy)} سفارش داده شود
                  </p>
                  {r.bestSupplier && (
                    <p className="mt-1 text-sm text-gray-600">
                      بهترین گزینه: {r.bestSupplier.supplierName} — {r.bestSupplier.unitPrice.toLocaleString("fa-IR")} تومان ·{" "}
                      {r.bestSupplier.leadTimeDays} روز تحویل
                      {r.bestSupplier.onTimeRate != null && ` · ${Math.round(r.bestSupplier.onTimeRate * 100)}٪ تحویل به‌موقع`}
                      {r.supplierCount > 1 && ` (از بین ${r.supplierCount} تأمین‌کننده)`}
                    </p>
                  )}
                  <p className="mt-2 rounded-lg bg-brand/5 p-2 text-sm text-brand-dark">{r.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
