/** JWT portal soporte-staging — persistido en BD_AUTH por usuario (system-login). */
import { Config, Session } from "../core/platform.ts";

export const PATYIA_PORTAL_ID = "soporte-staging";

export type PortalJwtResponse = {
  ok: boolean;
  portal?: string;
  token?: string | null;
  expiresAt?: string | null;
  savedAt?: string | null;
  expired?: boolean;
  error?: string;
};

function authHeaders(): HeadersInit {
  return { Accept: "application/json", ...Session.authHeader(), ...Session.appHeader() };
}

function portalUrl(portal: string, query = "") {
  const q = `portal=${encodeURIComponent(portal)}${query ? `&${query}` : ""}`;
  return Config.apiUrl(`/api/auth/portal-jwt?${q}`);
}

export async function fetchPortalJwt(portal = PATYIA_PORTAL_ID): Promise<PortalJwtResponse> {
  const res = await fetch(portalUrl(portal), { headers: authHeaders() });
  const data = (await res.json().catch(() => ({}))) as PortalJwtResponse;
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo cargar el JWT del portal");
  }
  return data;
}

export async function savePortalJwt(token: string, portal = PATYIA_PORTAL_ID): Promise<PortalJwtResponse> {
  const res = await fetch(portalUrl(portal), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ portal, token }),
  });
  const data = (await res.json().catch(() => ({}))) as PortalJwtResponse;
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo guardar el JWT del portal");
  }
  return data;
}

export async function removePortalJwt(portal = PATYIA_PORTAL_ID): Promise<void> {
  const res = await fetch(portalUrl(portal), { method: "DELETE", headers: authHeaders() });
  const data = (await res.json().catch(() => ({}))) as PortalJwtResponse;
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo eliminar el JWT del portal");
  }
}
