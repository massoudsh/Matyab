interface MatchExplanationCardProps {
  matchScore: number;
  reason?: string;
  shippingCost?: number;
}

export function MatchExplanationCard({ matchScore, reason, shippingCost }: MatchExplanationCardProps) {
  const verdict =
    matchScore >= 70
      ? "این گزینه به‌صرفه است"
      : matchScore >= 40
      ? "این گزینه با احتیاط بررسی شود"
      : "این گزینه با احتساب حمل به‌صرفه نیست";

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="font-semibold">{verdict}</p>
      {reason && <p className="mt-1 text-sm text-gray-600">{reason}</p>}
      {shippingCost != null && (
        <p className="mt-1 text-sm text-gray-600">
          هزینه‌ی حمل تخمینی: {shippingCost.toLocaleString("fa-IR")} تومان
        </p>
      )}
      <p className="mt-2 text-xs text-gray-400">امتیاز تطابق: {matchScore}/100</p>
    </div>
  );
}
