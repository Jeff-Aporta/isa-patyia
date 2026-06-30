import { Session } from "../core/platform.ts";
import { resolveIssApiBase } from "../core/patyia.ts";

export type OpenAiSystemConfig = {
  max_num_results: number;
  modeloOperativo: string;
  modeloConversacion: string;
  canEdit?: boolean;
};

const OPENAI_DEFAULTS: OpenAiSystemConfig = {
  max_num_results: 8,
  modeloOperativo: "gpt-4.1-nano",
  modeloConversacion: "gpt-5-nano",
};

function systemApiBase(): string {
  return resolveIssApiBase();
}

function systemApiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/json",
    "X-Patyia-Auth-Mode": "w",
    ...extra,
  };
  if (Session.isLoggedIn()) Object.assign(h, Session.authHeader(), Session.appHeader());
  return h;
}

function unwrapBody<T>(data: unknown): T {
  const d = data as Record<string, unknown>;
  if (d?.respuesta && typeof d.respuesta === "object") return d.respuesta as T;
  if (d?.body && typeof d.body === "object") return d.body as T;
  return d as T;
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${systemApiBase()}${path}`, init);
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
  const body = await jsonFetch<{ config?: OpenAiSystemConfig; canEdit?: boolean }>("/system/openai", { method: "GET", headers: systemApiHeaders() });
  return { ...OPENAI_DEFAULTS, ...(body.config ?? {}), canEdit: !!body.canEdit };
}

export async function putOpenAiSystemConfig(config: OpenAiSystemConfig): Promise<OpenAiSystemConfig> {
  const { canEdit: _c, ...payload } = config;
  const body = await jsonFetch<{ config?: OpenAiSystemConfig }>("/system/openai", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const saved = body.config ?? payload;
  window.dispatchEvent(new CustomEvent("isa-patyia:openai-config", { detail: saved }));
  return saved;
}

export type PromptsOperativosConfig = Record<string, unknown>;

export async function fetchPromptsOperativosConfig(): Promise<{ config: PromptsOperativosConfig; canEdit: boolean }> {
  const body = await jsonFetch<{ config?: PromptsOperativosConfig; canEdit?: boolean }>("/system/prompts-operativos", { method: "GET", headers: systemApiHeaders() });
  return { config: body.config ?? {}, canEdit: !!body.canEdit };
}

export async function putPromptsOperativosConfig(config: PromptsOperativosConfig): Promise<PromptsOperativosConfig> {
  const body = await jsonFetch<{ config?: PromptsOperativosConfig }>("/system/prompts-operativos", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return body.config ?? config;
}

/** PERMISOS JSON único: roles de usuario en permisos.roles; descripción de rol en permisos.descripcion */
export type PermEntry = { iusuario: string; itipo: "user" | "role"; permisos: Record<string, unknown>; bactivo: boolean };
export type PermissionsData = {
  roles: PermEntry[];
  users: PermEntry[];
  usersTotal?: number;
  usersTruncated?: boolean;
  canManage?: boolean;
  canEditRoleDescriptions?: boolean;
  actorRoles?: string[];
};

export type HierarchyNode = {
  iusuario: string;
  jerarquia: string;
  namedisplay: string | null;
  descripcion: string | null;
};

export type HierarchyListResponse = {
  roles: HierarchyNode[];
  count: number;
};

export type PermisosFetchOpts = { search?: string; role?: string };

/** GET /api/system/permisos/hierarchy — árbol completo de roles con jerarquía y parents. */
export async function fetchHierarchy(): Promise<HierarchyListResponse> {
  return jsonFetch<HierarchyListResponse>(`/system/permisos/hierarchy`, {
    method: "GET",
    headers: systemApiHeaders(),
  });
}

/** POST /api/system/permisos/hierarchy/roles — crea un rol. */
export async function createHierarchyRole(input: {
  name: string;
  jerarquia: string;
  descripcion?: string;
  namedisplay?: string;
}): Promise<HierarchyNode> {
  return jsonFetch<HierarchyNode>(`/system/permisos/hierarchy/roles`, {
    method: "POST",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT /api/system/permisos/hierarchy/roles/{name} — actualiza jerarquía. */
export async function updateHierarchyRole(name: string, input: { jerarquia: string }): Promise<HierarchyNode> {
  return jsonFetch<HierarchyNode>(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE /api/system/permisos/hierarchy/roles/{name} — elimina rol. */
export async function deleteHierarchyRole(name: string): Promise<void> {
  await jsonFetch(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: systemApiHeaders(),
  });
}

export async function fetchPermisos(opts?: PermisosFetchOpts): Promise<PermissionsData> {
  const qs = new URLSearchParams();
  const search = String(opts?.search ?? "").trim();
  const role = String(opts?.role ?? "").trim();
  if (search) qs.set("search", search);
  if (role) qs.set("role", role);
  const q = qs.toString();
  return jsonFetch<PermissionsData>(`/system/permisos${q ? `?${q}` : ""}`, { method: "GET", headers: systemApiHeaders() });
}

export async function putPermisoRole(name: string, permisos: Record<string, unknown>): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "role", name, permisos }),
  });
}

export async function putPermisoRolePath(name: string, permisos: Record<string, unknown>, bactivo?: boolean): Promise<PermissionsData> {
  const role = encodeURIComponent(String(name).trim().toLowerCase().replace(/^role:/, ""));
  const body: Record<string, unknown> = { permisos };
  if (bactivo !== undefined) body.bactivo = bactivo;
  return jsonFetch<PermissionsData>(`/system/permisos/roles/${role}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPermisoRole(name: string): Promise<PermissionsData> {
  return putPermisoRolePath(name, {});
}

export async function putPermisoUser(username: string, permisos: Record<string, unknown>): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "user", username, permisos }),
  });
}

export async function putPermisoUserPath(username: string, permisos: Record<string, unknown>): Promise<PermissionsData> {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch<PermissionsData>(`/system/permisos/usuarios/${u}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ permisos }),
  });
}

export async function patchUsuarioRoles(username: string, body: { fromRole: string; toRole: string; mode: "copy" | "move" }): Promise<PermissionsData> {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch<PermissionsData>(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addUsuarioRole(username: string, role: string): Promise<PermissionsData> {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch<PermissionsData>(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ toRole: String(role).trim().toLowerCase(), mode: "add" }),
  });
}

export async function removeUsuarioRole(username: string, role: string): Promise<PermissionsData> {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch<PermissionsData>(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ fromRole: String(role).trim().toLowerCase(), mode: "remove" }),
  });
}

export async function deletePermisoUser(username: string): Promise<PermissionsData> {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch<PermissionsData>(`/system/permisos/usuarios/${u}`, {
    method: "DELETE",
    headers: systemApiHeaders(),
  });
}

export async function deletePermiso(iusuario: string): Promise<PermissionsData> {
  return jsonFetch<PermissionsData>("/system/permisos", {
    method: "DELETE",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ iusuario }),
  });
}

export function requireAppSession(onNeedLogin?: () => void): boolean {
  if (Session.isLoggedIn()) return true;
  onNeedLogin?.();
  return false;
}
