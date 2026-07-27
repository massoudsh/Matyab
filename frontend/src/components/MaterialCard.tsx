import { Listing } from "@/lib/api";

export function MaterialCard({ listing }: { listing: Listing }) {
  return (
    <a
      href={`/listings/${listing.id}`}
      className="block overflow-hidden rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-video bg-gray-100">
        {listing.photos[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photos[0]} alt="مصالح" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-500">
          {listing.quantity} {listing.unit}
        </p>
        <p className="mt-1 font-semibold">
          {listing.askingPrice.toLocaleString("fa-IR")} تومان
        </p>
      </div>
    </a>
  );
}
