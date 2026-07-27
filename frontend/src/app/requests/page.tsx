import { api } from "@/lib/api";
import { RequestCard } from "@/components/RequestCard";

export default async function RequestsPage() {
  const requests = await api.getRequests().catch(() => []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">درخواست‌های تقاضای مصالح</h1>
        <a href="/requests/new" className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark">
          ثبت درخواست جدید
        </a>
      </div>
      {requests.length === 0 ? (
        <p className="text-gray-500">فعلاً درخواست فعالی ثبت نشده است.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
