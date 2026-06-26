import { PATYIA_API_BASE, loadPatyJwt, type PatyJwtRecord } from "../core/patyia-jwt.ts";
import { patyAuthHeaders } from "./patyiaTokens.ts";

export type OpenAiSystemConfig = { max_num_results: number; canEdit?: boolean };

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

function optionalPatyHeaders(jwt?: PatyJwtRecord | null): Record<string, string> {
  return jwt?.token ? patyAuthHeaders(jwt) : {};
}

export async function fetchOpenAiSystemConfig(jwt?: PatyJwtRecord | null): Promise<OpenAiSystemConfig> {
  const body = await jsonFetch<{ config?: OpenAiSystemConfig; canEdit?: boolean }>("/system/openai", { method: "GET", headers: optionalPatyHeaders(jwt) });
  return { ...(body.config ?? { max_num_results: 8 }), canEdit: !!body.canEdit };
}

export async function putOpenAiSystemConfig(config: OpenAiSystemConfig, jwt: PatyJwtRecord): Promise<OpenAiSystemConfig> {
  const body = await jsonFetch<{ config?: OpenAiSystemConfig }>("/system/openai", {
    method: "PUT",
    headers: { ...patyAuthHeaders(jwt), "Content-Type": "application/json" },
    body: JSON.stringify({ max_num_results: config.max_num_results }),
  });
  return body.config ?? config;
}

export type PromptsOperativosConfig = Record<string, unknown>;

export async function fetchPromptsOperativosConfig(jwt?: PatyJwtRecord | null): Promise<{ config: PromptsOperativosConfig; canEdit: boolean }> {
  const body = await jsonFetch<{ config?: PromptsOperativosConfig; canEdit?: boolean }>("/system/prompts-operativos", { method: "GET", headers: optionalPatyHeaders(jwt) });
  return { config: body.config ?? {}, canEdit: !!body.canEdit };
}

export async function putPromptsOperativosConfig(config: PromptsOperativosConfig, jwt: PatyJwtRecord): Promise<PromptsOperativosConfig> {
  const body = await jsonFetch<{ config?: PromptsOperativosConfig }>("/system/prompts-operativos", {
    method: "PUT",
    headers: { ...patyAuthHeaders(jwt), "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return body.config ?? config;
}

export type PermEntry = { iusuario: string; itipo: "user" | "role"; roles: string[]; permisos: Record<string, unknown>; descripcion: string | null; bactivo: boolean };
export type PermissionsData = { roles: PermEntry[]; users: PermEntry[]; canManage?: boolean };

export async function fetchPermisos(jwt?: PatyJwtRecord | null): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", { method: "GET", headers: optionalPatyHeaders(jwt) });
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
  if (!jwt?.token) { onNeedLogin?.(); return null; }
  return jwt;
}
