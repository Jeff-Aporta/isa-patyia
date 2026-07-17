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
  // Defensa: ISS no debe recibir suplantoación / «ver como» (solo Bearer real).
  for (const k of Object.keys(h)) {
    if (/^x-view-as-/i.test(k)) delete h[k];
  }
  return h;
}

function unwrapBody<T>(data: unknown): T {
  const d = data as Record<string, unknown>;
  const enc = d?.encabezado;
  if (enc && typeof enc === "object" && !Array.isArray(enc) && (enc as { resultado?: boolean }).resultado === false) {
    const e = enc as { mensaje?: unknown; imensaje?: unknown };
    const msg = String(e.mensaje ?? e.imensaje ?? "").trim();
    throw new Error(msg || "Error en la respuesta del servidor");
  }
  let inner: unknown = d;
  if (d?.respuesta && typeof d.respuesta === "object" && !Array.isArray(d.respuesta)) {
    inner = d.respuesta;
  } else if (d?.body && typeof d.body === "object" && !Array.isArray(d.body)) {
    inner = d.body;
  }
  const nested = inner as Record<string, unknown>;
  if (nested?.respuesta && typeof nested.respuesta === "object" && !Array.isArray(nested.respuesta)) {
    inner = nested.respuesta;
  }
  return inner as T;
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${systemApiBase()}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json() as Record<string, unknown>;
        const enc = j.encabezado as { mensaje?: unknown; resultado?: boolean } | undefined;
        if (enc?.resultado === false && enc.mensaje) msg = String(enc.mensaje);
        else {
          const inner = j.respuesta || j.body || j;
          msg = String((inner as Record<string, unknown>)?.message || (inner as Record<string, unknown>)?.error || j.message || j.error || msg);
        }
      } catch { /* ignore */ }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (!ct.includes("json")) {
    throw new Error(`Respuesta no JSON (${res.status}) desde ${systemApiBase()}${path}`);
  }
  const raw = await res.json();
  return unwrapBody<T>(raw);
}

function permEntityKey(entry: Record<string, unknown> | null | undefined): string {
  return String(entry?.ientity ?? entry?.iusuario ?? "").trim();
}

function normalizePermEntry(entry: Record<string, unknown>): PermEntry {
  const key = permEntityKey(entry);
  return {
    iusuario: key,
    ientity: key || undefined,
    itipo: (entry?.itipo === "user" ? "user" : "role") as "user" | "role",
    permisos: (entry?.permisos && typeof entry.permisos === "object" ? entry.permisos : {}) as Record<string, unknown>,
    bactivo: entry?.bactivo !== false,
  };
}

function normalizeHierarchyNode(node: Record<string, unknown>): HierarchyNode {
  const iusuario = permEntityKey(node).toLowerCase();
  return {
    iusuario,
    jerarquia: String(node.jerarquia ?? iusuario ?? "").trim(),
    namedisplay: node.namedisplay != null ? String(node.namedisplay) : null,
    descripcion: node.descripcion != null ? String(node.descripcion) : null,
  };
}

function normalizePermissionsPayload(raw: PermissionsData): PermissionsData {
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).map((e) => normalizePermEntry(e as Record<string, unknown>));
  const users = (Array.isArray(raw?.users) ? raw.users : []).map((e) => normalizePermEntry(e as Record<string, unknown>));
  return { ...raw, roles, users };
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

export type InstruccionesSystemRow = Record<string, unknown>;

export type InstruccionesSystemConfig = {
  rows: InstruccionesSystemRow[];
  canEdit: boolean;
  storage?: string;
  schema?: string;
  rowCount?: number;
};

export type InstruccionUpsertPayload = {
  iinstruccion: string;
  instruccion: string;
  jconfig?: Record<string, unknown>;
  ninstruccion?: string;
  descripcion?: string;
  author?: string;
};

/** GET /api/system/instrucciones — dbo.INSTRUCCION (canónico). */
export async function fetchInstruccionesSystemConfig(): Promise<InstruccionesSystemConfig> {
  const body = await jsonFetch<{
    rows?: InstruccionesSystemRow[];
    canEdit?: boolean;
    storage?: string;
    schema?: string;
    rowCount?: number;
  }>("/system/instrucciones", { method: "GET", headers: systemApiHeaders() });
  const rows = Array.isArray(body.rows) ? body.rows : [];
  return {
    rows,
    canEdit: !!body.canEdit,
    storage: body.storage,
    schema: body.schema,
    rowCount: Number(body.rowCount ?? rows.length) || rows.length,
  };
}

/** PUT upsert una instrucción. */
export async function putInstruccionUpsert(payload: InstruccionUpsertPayload): Promise<{ ok: boolean; iinstruccion?: string }> {
  return jsonFetch("/system/instrucciones", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** PUT publish batch MERGE SQL. */
export async function putInstruccionesPublish(sql: string): Promise<{ ok: boolean; mode?: string }> {
  return jsonFetch("/system/instrucciones", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
}

/** PERMISOS JSON único: roles de usuario en permisos.roles; descripción de rol en permisos.descripcion */
export type PermEntry = { iusuario: string; ientity?: string; itipo: "user" | "role"; permisos: Record<string, unknown>; bactivo: boolean };
export type PermissionsData = {
  roles: PermEntry[];
  users: PermEntry[];
  usersTotal?: number;
  usersTruncated?: boolean;
  canManage?: boolean;
  canEditRoleDescriptions?: boolean;
  canAssignUserRoles?: boolean;
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

export type PermisosFetchOpts = { search?: string; role?: string; /** Top N usuarios (autocomplete). */ limit?: number };

/**
 * Shape insoft.permissions-me v1 — fuente de verdad de permisos del usuario.
 * Refleja el sistema de herencias + override del ISS; ver GET /api/permissions/me.
 */
export type PermissionsMe = {
  kind: "insoft.permissions-me";
  version: 1;
  username: string;
  loginRole: string | null;
  roles: string[];
  jerarquias: string[];
  jerarquiaMax: string;
  isWildcard: boolean;
  permisos: Record<string, true>;
  permisosEfectivos: Record<string, unknown>;
  restricciones: Record<string, unknown>;
  capabilities: {
    canEditOpenAiConfig: boolean;
    canEditSwagger: boolean;
    canEditInstrucciones: boolean;
    canEditPromptsOperativos: boolean;
    canEditConversacionConfig: boolean;
    canOverrideSampling: boolean;
    canManagePermissions: boolean;
    canImpersonate: boolean;
    canAssignUserRoles: boolean;
    canAccessOthers: boolean;
    canViewKanban: boolean;
    canEditKanbanCards: boolean;
  };
  iat: number;
  ttlMs: number;
};

const PERMISSIONS_ME_CACHE: { value: PermissionsMe | null; iat: number; ttlMs: number; key: string } = { value: null, iat: 0, ttlMs: 0, key: "" };

function permissionsMeSessionKey(): string {
  if (!Session.isLoggedIn()) return "anon";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "anon").trim();
}

/** Devuelve los permisos del usuario actual. Cache en memoria con TTL del servidor. */
export async function fetchPermissionsMe(opts?: { force?: boolean; fetchImpl?: typeof fetch }): Promise<PermissionsMe | null> {
  if (!Session.isLoggedIn()) return null;
  const sessionKey = permissionsMeSessionKey();
  if (!opts?.force && PERMISSIONS_ME_CACHE.value && PERMISSIONS_ME_CACHE.key === sessionKey && Date.now() - PERMISSIONS_ME_CACHE.iat < PERMISSIONS_ME_CACHE.ttlMs) {
    return PERMISSIONS_ME_CACHE.value;
  }
  const f = opts?.fetchImpl ?? fetch;
  const res = await f(`${systemApiBase()}/permissions/me`, {
    method: "GET",
    headers: { ...systemApiHeaders(), Accept: "application/json" },
    credentials: "omit",
  });
  if (res.status === 401) {
    PERMISSIONS_ME_CACHE.value = null;
    return null;
  }
  if (!res.ok) return PERMISSIONS_ME_CACHE.value;
  const data = unwrapBody<PermissionsMe>(await res.json());
  if (!data || data.kind !== "insoft.permissions-me") return PERMISSIONS_ME_CACHE.value;
  PERMISSIONS_ME_CACHE.value = data;
  PERMISSIONS_ME_CACHE.iat = data.iat || Date.now();
  PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 60_000;
  PERMISSIONS_ME_CACHE.key = sessionKey;
  return data;
}

export function clearPermissionsMeCache(): void {
  PERMISSIONS_ME_CACHE.value = null;
  PERMISSIONS_ME_CACHE.iat = 0;
  PERMISSIONS_ME_CACHE.ttlMs = 0;
  PERMISSIONS_ME_CACHE.key = "";
}

/** Aplica capabilities de PermissionsMe sobre el shape PermissionsData del kanban. */
export function applyPermissionsMeToKanban(data: PermissionsData, me: PermissionsMe | null): PermissionsData {
  if (!me) return data;
  return {
    ...data,
    canManage: me.capabilities.canManagePermissions,
    canAssignUserRoles: me.capabilities.canAssignUserRoles,
    canEditRoleDescriptions: me.capabilities.canEditRoleDescriptions || me.capabilities.canManagePermissions,
    actorRoles: me.roles,
    _permissionsMe: me,
  } as PermissionsData;
}

/** GET /api/system/permisos/hierarchy — árbol completo de roles con jerarquía y parents. */
export async function fetchHierarchy(): Promise<HierarchyListResponse> {
  const raw = await jsonFetch<HierarchyListResponse>(`/system/permisos/hierarchy`, {
    method: "GET",
    headers: systemApiHeaders(),
  });
  const roles = (Array.isArray(raw?.roles) ? raw.roles : [])
    .map((r) => normalizeHierarchyNode(r as Record<string, unknown>))
    .filter((r) => r.iusuario && r.jerarquia);
  return { roles, count: roles.length || Number(raw?.count ?? 0) || 0 };
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
  const limit = opts?.limit != null && Number.isFinite(Number(opts.limit))
    ? Math.min(500, Math.max(1, Math.floor(Number(opts.limit))))
    : undefined;
  if (search) qs.set("search", search);
  if (role) qs.set("role", role);
  if (limit != null) qs.set("limit", String(limit));
  const q = qs.toString();
  // Fuente de verdad: /permissions/me (capabilities del JWT actual con herencias).
  // Se llama en paralelo al listado y sus flags sobrescriben los del listado.
  const [raw, me] = await Promise.all([
    jsonFetch<PermissionsData>(`/system/permisos${q ? `?${q}` : ""}`, { method: "GET", headers: systemApiHeaders() }),
    fetchPermissionsMe().catch(() => null),
  ]);
  return applyPermissionsMeToKanban(normalizePermissionsPayload(raw), me);
}

export type PermisosUserOption = { username: string; displayName: string | null };

/** GET /api/system/permisos?search=&limit= — usuarios ISS (SYS_USR_PERMISSIONS). Default limit 10 (autocomplete). */
export async function searchPermisosUsers(query = "", opts?: { role?: string; limit?: number }): Promise<PermisosUserOption[]> {
  const q = String(query ?? "").trim();
  const limit = opts?.limit != null && Number.isFinite(Number(opts.limit))
    ? Math.min(500, Math.max(1, Math.floor(Number(opts.limit))))
    : 10;
  const result = await fetchPermisos({
    ...(q ? { search: q } : {}),
    ...(opts?.role ? { role: opts.role } : {}),
    limit,
  });
  return (result.users ?? []).map((e) => ({
    username: String(e.iusuario ?? "").trim().toUpperCase(),
    displayName: (() => {
      const p = e.permisos;
      const name = p?.nombre ?? p?.namedisplay;
      return name != null && String(name).trim() ? String(name).trim() : null;
    })(),
  })).filter((u) => u.username).slice(0, limit);
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
