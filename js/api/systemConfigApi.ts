import { PATYIA_API_BASE, loadPatyJwt, type PatyJwtRecord } from "../core/patyia-jwt.ts";
import { patyAuthHeaders } from "./patyiaTokens.ts";

export type OpenAiSystemConfig = {
  max_num_results: number;
};

function unwrapBody<T>(data: unknown): T {
  const d = data as Record<string, unknown>;
  if (d?.respuesta && typeof d.respuesta === "object") return d.respuesta as T;
  if (d?.body && typeof d.body === "object") return d.body as T;
  return d as T;
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PATYIA_API_BASE}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json() as Record<string, unknown>;
        const inner = j.respuesta || j.body || j;
        msg = String((inner as Record<string, unknown>)?.error || j.error || j.message || msg);
      } catch { /* ignore */ }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (!ct.includes("json")) return {} as T;
  const raw = await res.json();
  return unwrapBody<T>(raw);
}

export async function fetchOpenAiSystemConfig(): Promise<OpenAiSystemConfig> {
  const body = await jsonFetch<{ config?: OpenAiSystemConfig }>("/system/openai", { method: "GET" });
  return body.config ?? { max_num_results: 8 };
}

export async function putOpenAiSystemConfig(config: OpenAiSystemConfig, jwt: PatyJwtRecord): Promise<OpenAiSystemConfig> {
  const body = await jsonFetch<{ config?: OpenAiSystemConfig }>("/system/openai", {
    method: "PUT",
    headers: {
      ...patyAuthHeaders(jwt),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
  return body.config ?? config;
}

export type PermEntry = {
  iusuario: string;
  itipo: "user" | "role";
  roles: string[];
  permisos: Record<string, unknown>;
  descripcion: string | null;
  bactivo: boolean;
};
export type PermissionsData = { roles: PermEntry[]; users: PermEntry[]; canManage?: boolean };

export async function fetchPermisos(jwt: PatyJwtRecord): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", { method: "GET", headers: { ...patyAuthHeaders(jwt) } });
}

export async function putPermisoRole(name: string, permisos: Record<string, unknown>, descripcion: string | null, jwt: PatyJwtRecord): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", {
    method: "PUT",
    headers: { ...patyAuthHeaders(jwt), "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "role", name, permisos, descripcion }),
  });
}

export async function putPermisoUser(username: string, roles: string[], descripcion: string | null, jwt: PatyJwtRecord): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", {
    method: "PUT",
    headers: { ...patyAuthHeaders(jwt), "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "user", username, roles, descripcion }),
  });
}

export async function deletePermiso(iusuario: string, jwt: PatyJwtRecord): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", {
    method: "DELETE",
    headers: { ...patyAuthHeaders(jwt), "Content-Type": "application/json" },
    body: JSON.stringify({ iusuario }),
  });
}

export function requirePatyJwt(onNeedLogin?: () => void): PatyJwtRecord | null {
  const jwt = loadPatyJwt();
  if (!jwt?.token) {
    onNeedLogin?.();
    return null;
  }
  return jwt;
}
