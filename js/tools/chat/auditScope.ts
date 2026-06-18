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

/** Nick ISA / AUTH (username): dueño del JWT o sesión activa. */
export function resolveOwnerNickname(jwt, sessionUser) {
  const acting = String(jwt?.actingAsUsername ?? "").trim().toUpperCase();
  if (acting) return acting;
  const saved = String(jwt?.savedBy ?? "").trim().toUpperCase();
  if (saved) return saved;
  return String(sessionUser ?? "").trim().toUpperCase();
}

/** Solo códigos tercero y contacto (sin nombre legible). */
export function convOwnerCodesLabel(scope) {
  const t = String(scope?.itercero ?? "").trim();
  const c = String(scope?.icontacto ?? "").trim();
  if (t && c) return `${t} · ${c}`;
  return t || c || "";
}

/** Etiqueta del dueño: nick si existe; si no, códigos tercero/contacto. */
export function convOwnerDisplayLabel(scope, jwt, sessionUser) {
  const nick = resolveOwnerNickname(jwt, sessionUser);
  if (nick) return nick;
  const codes = convOwnerCodesLabel(scope);
  return codes || "Usuario";
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
export function resolveConvListOwnerLabel(listScope, jwt, sessionUser) {
  return convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims), jwt, sessionUser);
}

/** Línea bajo «Conversaciones»: nick o códigos (sin nombre completo del JWT). */
export function resolveConvListHeader(listScope, jwt, sessionUser) {
  return resolveConvListOwnerLabel(listScope, jwt, sessionUser);
}

export function formatAuditTs(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}
