import { PriceRiskLevel } from "@/lib/api";

const RISK_STYLE: Record<PriceRiskLevel, string> = {
  HIGH: "bg-rose-100 text-rose-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-emerald-100 text-emerald-800",
  UNKNOWN: "bg-gray-100 text-gray-500",
};

const RISK_LABEL: Record<PriceRiskLevel, string> = {
  HIGH: "ریسک قیمت بالا",
  MEDIUM: "ریسک قیمت متوسط",
  LOW: "ریسک قیمت پایین",
  UNKNOWN: "داده‌ی قیمت کافی نیست",
};

export function PriceRiskBadge({ level, changePct }: { level: PriceRiskLevel; changePct?: number | null }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_STYLE[level]}`}>
      {RISK_LABEL[level]}
      {changePct != null && ` (${changePct > 0 ? "+" : ""}${changePct}٪)`}
    </span>
  );
}
