import { api } from "@/lib/api";
import { QualityScoreBadge } from "@/components/QualityScoreBadge";
import { PriceSuggestionBadge } from "@/components/PriceSuggestionBadge";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await api.getListing(params.id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="aspect-video overflow-hidden rounded-xl bg-gray-100">
        {listing.photos[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photos[0]} alt="مصالح" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{listing.category?.name ?? "آگهی مصالح"}</h1>
        {listing.qualityAssessment && (
          <QualityScoreBadge grade={listing.qualityAssessment.grade} score={listing.qualityAssessment.score} />
        )}
      </div>

      <p className="mt-2 text-gray-600">
        {listing.quantity} {listing.unit} · {listing.project?.city}
      </p>
      <p className="mt-2 text-lg font-semibold text-brand-dark">
        {listing.askingPrice.toLocaleString("fa-IR")} تومان
      </p>

      {listing.description && <p className="mt-3 text-gray-700">{listing.description}</p>}

      {listing.priceSuggestion && (
        <div className="mt-4">
          <PriceSuggestionBadge
            suggestedPrice={listing.priceSuggestion.suggestedPrice}
            basis={listing.priceSuggestion.basis ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
