import { fetchTercerosAudit, type TerceroAuditRow } from "../api/apiClient.ts";
import { shortDisplayName } from "./patyia-jwt.ts";

export type BrowseScope = {
  itercero: string;
  icontacto: string;
  nombre?: string | null;
};

export function usernameMatchesNombre(
  username: string | null | undefined,
  nombre: string | null | undefined,
): boolean {
  const u = String(username ?? "").trim().toUpperCase();
  const parts = String(nombre ?? "").trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (!u || !parts.length) return false;
  const lastName = parts[parts.length - 1];
  if (lastName.length >= 3 && (u.includes(lastName) || lastName.includes(u))) return true;
  const firstInitial = parts[0]?.[0] ?? "";
  if (firstInitial && u.startsWith(firstInitial) && lastName.length >= 3 && u.includes(lastName)) return true;
  return false;
}

export function findAuditRowForSessionUser(
  rows: TerceroAuditRow[],
  sessionUser: string | null | undefined,
): TerceroAuditRow | null {
  const u = String(sessionUser ?? "").trim();
  if (!u) return null;
  const flagged = rows.find((r) => r.es_sesion);
  if (flagged) return flagged;
  return rows.find((r) => usernameMatchesNombre(u, r.nombre)) ?? null;
}

export function auditRowToBrowseScope(row: TerceroAuditRow): BrowseScope {
  return {
    itercero: row.itercero,
    icontacto: row.icontacto,
    nombre: row.nombre ? shortDisplayName(row.nombre) : null,
  };
}

export async function resolveSessionBrowseScope(
  sessionUser: string | null | undefined,
): Promise<BrowseScope | null> {
  const u = String(sessionUser ?? "").trim();
  if (!u) return null;
  let page = 1;
  const limit = 100;
  while (page <= 5) {
    const audit = await fetchTercerosAudit({ page, limit, appUser: u });
    const match = findAuditRowForSessionUser(audit.rows, u);
    if (match) return auditRowToBrowseScope(match);
    if (page >= (audit.pages || 1)) break;
    page += 1;
  }
  return null;
}

export function browseScopeKey(scope: BrowseScope | null | undefined): string {
  if (!scope?.itercero || !scope?.icontacto) return "";
  return `${scope.itercero}|${scope.icontacto}`;
}
