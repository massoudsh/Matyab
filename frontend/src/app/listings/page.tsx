import { api } from "@/lib/api";
import { MaterialCard } from "@/components/MaterialCard";
import { flattenCategories } from "@/lib/categories";

interface ListingsPageProps {
  searchParams: { categoryId?: string; city?: string; minPrice?: string; maxPrice?: string };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const filters = {
    categoryId: searchParams.categoryId || undefined,
    city: searchParams.city || undefined,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
  };

  const [listings, categories] = await Promise.all([
    api.getListings(filters).catch(() => []),
    api.getCategories().catch(() => []),
  ]);
  const flatCategories = flattenCategories(categories);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">آگهی‌های عرضه‌ی مصالح</h1>
        <a href="/listings/new" className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark">
          ثبت آگهی جدید
        </a>
      </div>

      <form className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-4">
        <select
          name="categoryId"
          defaultValue={filters.categoryId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">همه‌ی دسته‌ها</option>
          {flatCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          name="city"
          defaultValue={filters.city ?? ""}
          placeholder="شهر"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="minPrice"
          type="number"
          defaultValue={filters.minPrice ?? ""}
          placeholder="حداقل قیمت"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="maxPrice"
          type="number"
          defaultValue={filters.maxPrice ?? ""}
          placeholder="حداکثر قیمت"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="col-span-2 rounded-lg bg-brand-dark px-3 py-2 text-sm text-white sm:col-span-1"
        >
          فیلتر
        </button>
        <a
          href="/listings"
          className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm text-gray-600 sm:col-span-1"
        >
          حذف فیلتر
        </a>
      </form>

      {listings.length === 0 ? (
        <p className="text-gray-500">آگهی‌ای با این مشخصات یافت نشد.</p>
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
