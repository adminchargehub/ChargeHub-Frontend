/**
 * Thin fetch wrapper around the ChargeHub API.
 *
 * Request and response shapes come from `schema.d.ts`, which is generated from
 * the backend's OpenAPI document (`npm run gen:api`). Nothing here hand-declares
 * a field name — that is deliberate. The worst defect in the 2016 prototype was
 * a silent client/server contract mismatch (firmware sent `?type=`, PHP read
 * `msgType`), dead for nine years because nothing checked. Generating the client
 * types from the server's own schema makes that class of bug a compile error.
 */

import type { components } from "./schema";

export type UserOut = components["schemas"]["UserOut"];
export type TokenResponse = components["schemas"]["TokenResponse"];
export type StationOut = components["schemas"]["StationOut"];
export type StationDetailOut = components["schemas"]["StationDetailOut"];
export type OutletOut = components["schemas"]["OutletOut"];
export type AvailabilityQuery = components["schemas"]["AvailabilityQuery"];
export type AvailabilityResponse = components["schemas"]["AvailabilityResponse"];
export type OutletStatus = components["schemas"]["OutletStatus"];

const BASE = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "chargehub.token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode / blocked storage — session stays in memory only */
  }
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined) headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers });

  if (res.status === 401) {
    setToken(null);
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      // FastAPI returns `detail` as a string, or an array for 422s.
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail) && body.detail[0]?.msg) detail = body.detail[0].msg;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  register: (body: components["schemas"]["RegisterRequest"]) =>
    request<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: components["schemas"]["LoginRequest"]) =>
    request<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<UserOut>("/auth/me"),

  listStations: () => request<StationOut[]>("/stations"),

  getStation: (id: string) => request<StationDetailOut>(`/stations/${id}`),

  checkAvailability: (id: string, body: AvailabilityQuery) =>
    request<AvailabilityResponse>(`/stations/${id}/availability`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
