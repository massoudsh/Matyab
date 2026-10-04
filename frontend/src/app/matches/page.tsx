"use client";

import { useEffect, useState } from "react";
import { api, Match } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { MatchExplanationCard } from "@/components/MatchExplanationCard";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    api.getMatches().then(setMatches).catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری تطابق‌ها");
    }).finally(() => setLoaded(true));
  }, []);

  async function updateStatus(match: Match, action: "accept" | "reject") {
    setError(null);
    setUpdatingId(match.id);
    try {
      const updated = action === "accept" ? await api.acceptMatch(match.id) : await api.rejectMatch(match.id);
      setMatches((current) => current.map((item) => item.id === updated.id ? { ...item, status: updated.status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در به‌روزرسانی تطابق");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!loaded) return <p role="status" className="text-gray-500">در حال بارگذاری تطابق‌ها...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">تطابق‌های من</h1>
        <p className="mt-1 text-sm text-gray-500">پیشنهادهای عرضه و تقاضا را بررسی و تأیید یا رد کنید.</p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {matches.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-600">هنوز تطابقی برای شما پیدا نشده است.</div> : (
        <div className="space-y-3">
          {matches.map((match) => <article key={match.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold">{match.listing.category?.name ?? "مصالح"}</h2>
                <p className="text-sm text-gray-500">عرضه: {match.listing.quantity} {match.listing.unit} · نیاز: {match.request.quantity}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{match.status === "SUGGESTED" ? "پیشنهادی" : match.status === "ACCEPTED" ? "پذیرفته‌شده" : "ردشده"}</span>
            </div>
            <MatchExplanationCard matchScore={match.matchScore} reason={match.reason ?? undefined} shippingCost={match.shippingEstimate?.estimatedCost} />
            {match.status === "SUGGESTED" && <div className="mt-3 flex gap-2">
              <button disabled={updatingId === match.id} onClick={() => updateStatus(match, "accept")} className="rounded-lg bg-brand px-3 py-2 text-sm text-white disabled:opacity-60">تأیید</button>
              <button disabled={updatingId === match.id} onClick={() => updateStatus(match, "reject")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-60">رد</button>
            </div>}
          </article>)}
        </div>
      )}
    </div>
  );
}
