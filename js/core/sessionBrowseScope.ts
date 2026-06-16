import { fetchTercerosAudit, type TerceroAuditRow } from "../api/apiClient.ts";
import { shortDisplayName } from "./patyia-jwt.ts";

export type BrowseScope = {
  itercero: string;
  icontacto: string;
  nombre?: string | null;
};

export function findAuditRowForSessionUser(
  rows: TerceroAuditRow[],
  _sessionUser: string | null | undefined,
): TerceroAuditRow | null {
  return rows.find((r) => r.es_sesion) ?? null;
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
