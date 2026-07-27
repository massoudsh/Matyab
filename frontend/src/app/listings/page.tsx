import { api } from "@/lib/api";
import { MaterialCard } from "@/components/MaterialCard";

export default async function ListingsPage() {
  const listings = await api.getListings().catch(() => []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">آگهی‌های عرضه‌ی مصالح</h1>
      {listings.length === 0 ? (
        <p className="text-gray-500">فعلاً آگهی فعالی ثبت نشده است.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <MaterialCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
