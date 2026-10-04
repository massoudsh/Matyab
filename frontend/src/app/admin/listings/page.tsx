"use client";

import { useEffect, useState } from "react";
import { api, Listing } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

export default function AdminPendingListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    const pending = await api.getPendingListings();
    setListings(pending);
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری — دسترسی ادمین لازم است"))
      .finally(() => setLoaded(true));
  }, []);

  async function decide(id: string, status: "ACTIVE" | "REJECTED") {
    const moderationReason = status === "REJECTED" ? window.prompt("دلیل رد آگهی را وارد کنید:")?.trim() : undefined;
    if (status === "REJECTED" && !moderationReason) return;
    setError(null);
    setUpdatingId(id);
    try {
      await api.setListingStatus(id, status, moderationReason);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت تصمیم");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!loaded) return <p className="text-gray-500">در حال بارگذاری...</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">تأیید آگهی‌های در انتظار</h1>
      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
      {listings.length === 0 ? (
        <p className="text-gray-500">آگهی در انتظار تأییدی وجود ندارد.</p>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="font-semibold">{listing.category?.name ?? "دسته نامشخص"}</p>
                <p className="text-sm text-gray-500">
                  {listing.quantity} {listing.unit} · {listing.project?.city} ·{" "}
                  {listing.askingPrice.toLocaleString("fa-IR")} تومان
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={updatingId === listing.id}
                  onClick={() => decide(listing.id, "ACTIVE")}
                  className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  تأیید
                </button>
                <button
                  disabled={updatingId === listing.id}
                  onClick={() => decide(listing.id, "REJECTED")}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                >
                  رد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
