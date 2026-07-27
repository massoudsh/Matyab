import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: "CONTRACTOR" | "SUPPLIER" | "ADMIN";
  city?: string | null;
  trustScore: number;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
}

export interface Project {
  id: string;
  name: string;
  city: string;
  region?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  ownerId: string;
}

export interface Listing {
  id: string;
  projectId: string;
  categoryId: string;
  category?: Category;
  project?: Project;
  quantity: number;
  unit: string;
  photos: string[];
  description?: string | null;
  askingPrice: number;
  status: string;
  qualityAssessment?: { score: number; grade: "A" | "B" | "C"; notes?: string | null } | null;
  priceSuggestion?: { suggestedPrice: number; minPrice: number; maxPrice: number; basis?: string | null } | null;
}

export interface MaterialRequest {
  id: string;
  projectId: string;
  categoryId: string;
  category?: Category;
  project?: Project;
  quantity: number;
  budget?: number | null;
  deadline?: string | null;
  status: string;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  basis?: string;
  sampleSize: number;
}

export interface ShippingEstimate {
  distanceKm: number;
  estimatedCost: number;
}

async function request<T>(path: string, options?: RequestInit & { auth?: boolean }): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `خطا در ارتباط با سرور (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

export const api = {
  // auth
  register: (input: { fullName: string; phone: string; password: string; role: "CONTRACTOR" | "SUPPLIER"; city?: string }) =>
    request<{ token: string }>("/auth/register", { method: "POST", body: JSON.stringify(input) }),
  login: (phone: string, password: string) =>
    request<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ phone, password }) }),
  me: () => request<User>("/auth/me", { auth: true }),

  // categories
  getCategories: () => request<Category[]>("/categories"),

  // projects
  getMyProjects: () => request<Project[]>("/projects", { auth: true }),
  createProject: (input: { name: string; city: string; region?: string; address?: string; lat?: number; lng?: number }) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(input), auth: true }),

  // listings
  getListings: (filters?: { categoryId?: string; city?: string; projectId?: string; minPrice?: number; maxPrice?: number }) =>
    request<Listing[]>(`/listings${toQuery(filters ?? {})}`),
  getListing: (id: string) => request<Listing>(`/listings/${id}`),
  createListing: (input: {
    projectId: string;
    categoryId: string;
    quantity: number;
    unit: string;
    photos: string[];
    description?: string;
    askingPrice: number;
  }) => request<Listing>("/listings", { method: "POST", body: JSON.stringify(input), auth: true }),
  getPendingListings: () => request<Listing[]>("/listings/pending", { auth: true }),
  setListingStatus: (id: string, status: "ACTIVE" | "REJECTED") =>
    request<Listing>(`/listings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }), auth: true }),
  getPriceSuggestion: (listingId: string) => request<PriceSuggestion>(`/listings/${listingId}/price-suggestion`),

  // requests
  getRequests: (filters?: { categoryId?: string; projectId?: string }) =>
    request<MaterialRequest[]>(`/requests${toQuery(filters ?? {})}`),
  getRequest: (id: string) => request<MaterialRequest>(`/requests/${id}`),
  createRequest: (input: { projectId: string; categoryId: string; quantity: number; budget?: number; deadline?: string }) =>
    request<MaterialRequest>("/requests", { method: "POST", body: JSON.stringify(input), auth: true }),

  // shipping
  estimateShipping: (fromProjectId: string, toProjectId: string) =>
    request<ShippingEstimate>(`/shipping/estimate${toQuery({ fromProjectId, toProjectId })}`),
};
