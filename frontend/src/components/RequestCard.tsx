import { MaterialRequest } from "@/lib/api";

export function RequestCard({ request }: { request: MaterialRequest }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 shadow-sm transition hover:shadow-md">
      <p className="font-semibold">{request.category?.name ?? "دسته‌ی مصالح"}</p>
      <p className="mt-1 text-sm text-gray-500">
        {request.quantity} واحد {request.project?.city ? `· ${request.project.city}` : ""}
      </p>
      {request.budget != null && (
        <p className="mt-1 text-sm text-gray-600">
          بودجه: {request.budget.toLocaleString("fa-IR")} تومان
        </p>
      )}
      {request.deadline && (
        <p className="mt-1 text-xs text-gray-400">
          مهلت: {new Date(request.deadline).toLocaleDateString("fa-IR")}
        </p>
      )}
    </div>
  );
}
