import { convBelongsToJwt, jwtUserShortName } from "../../core/patyia-jwt.ts";

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
      nombre: jwtUserShortName(claims) || null,
    };
  }
  return null;
}

export function formatAuditTs(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}
