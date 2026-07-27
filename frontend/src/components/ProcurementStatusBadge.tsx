import { ProcurementStatus } from "@/lib/api";

const STATUS_STYLE: Record<ProcurementStatus, string> = {
  CRITICAL: "bg-rose-100 text-rose-800",
  WATCH: "bg-amber-100 text-amber-800",
  OK: "bg-emerald-100 text-emerald-800",
  FULFILLED: "bg-gray-100 text-gray-600",
};

const STATUS_LABEL: Record<ProcurementStatus, string> = {
  CRITICAL: "بحرانی — سفارش فوری",
  WATCH: "در حال پایش",
  OK: "امن",
  FULFILLED: "تأمین‌شده",
};

export function ProcurementStatusBadge({ status }: { status: ProcurementStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
