const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export interface Listing {
  id: string;
  categoryId: string;
  quantity: number;
  unit: string;
  photos: string[];
  askingPrice: number;
  status: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `خطا در ارتباط با سرور (${res.status})`);
  }

  return res.json();
}

export const api = {
  getListings: (query?: string) => request<Listing[]>(`/listings${query ? `?${query}` : ""}`),
  getListing: (id: string) => request<Listing>(`/listings/${id}`),
};
