import { convBelongsToJwt, jwtUserShortName, jwtUserDisplayName } from "../../core/patyia-jwt.ts";

export function auditScopeKey(scope) {
  if (!scope) return "";
  return `${scope.itercero}|${scope.icontacto}`;
}

export function auditScopeIsOwnJwt(scope, claims) {
  if (!claims?.itercero) return !scope;
  if (!scope) return true;
  return convBelongsToJwt(scope, claims);
}

/** Etiqueta del dueño del hilo: nombre si existe; si no, códigos tercero/contacto. */
export function convOwnerDisplayLabel(scope) {
  const { itercero, icontacto, nombre } = scope ?? {};
  const name = String(nombre ?? "").trim();
  if (name) return name;
  const t = String(itercero ?? "").trim();
  const c = String(icontacto ?? "").trim();
  if (t && c) return `${t} / ${c}`;
  if (t) return t;
  if (c) return c;
  return "Usuario";
}

export function activeConvOwnerScope(auditScope, claims) {
  if (auditScope?.itercero && auditScope?.icontacto) return auditScope;
  if (claims?.itercero) {
    return {
      itercero: claims.itercero,
      icontacto: claims.icontacto,
      nombre: jwtUserDisplayName(claims) || jwtUserShortName(claims) || null,
    };
  }
  return null;
}

/** Etiqueta del dueño de las conversaciones listadas (auditoría, JWT ajeno o propio). */
export function resolveConvListOwnerLabel(listScope, jwt) {
  const auditName = String(listScope?.nombre ?? "").trim();
  if (auditName) return auditName;

  const actingName = String(jwt?.actingAsDisplayName ?? "").trim();
  if (jwt?.actingAsUsername && actingName) return actingName;

  const scope = activeConvOwnerScope(listScope, jwt?.claims);
  const scopeLabel = convOwnerDisplayLabel(scope);
  if (scopeLabel && scopeLabel !== "Usuario") return scopeLabel;

  const fromClaims = jwtUserDisplayName(jwt?.claims);
  if (fromClaims) return fromClaims;

  if (jwt?.actingAsUsername) return jwt.actingAsUsername;

  return "";
}

/** Línea consolidada bajo «Conversaciones»: nombre · itercero · contacto. */
export function resolveConvListHeader(listScope, jwt) {
  const scope = activeConvOwnerScope(listScope, jwt?.claims);
  const name = resolveConvListOwnerLabel(listScope, jwt);
  const tercero = String(scope?.itercero ?? "").trim();
  const contacto = String(scope?.icontacto ?? "").trim();
  const parts = [];
  if (name) parts.push(name);
  if (tercero) parts.push(tercero);
  if (contacto) parts.push(contacto);
  return parts.join(" · ");
}

export function formatAuditTs(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}
