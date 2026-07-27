export function PriceSuggestionBadge({
  suggestedPrice,
  basis,
}: {
  suggestedPrice: number;
  basis?: string;
}) {
  return (
    <div className="rounded-lg border border-brand/20 bg-brand/5 p-2 text-sm">
      <span className="font-semibold text-brand-dark">
        قیمت پیشنهادی: {suggestedPrice.toLocaleString("fa-IR")} تومان
      </span>
      {basis && <p className="mt-1 text-xs text-gray-600">{basis}</p>}
    </div>
  );
}
