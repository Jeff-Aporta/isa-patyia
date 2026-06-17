import { hasPendingChanges } from "./helpers.ts";

export function MapeoRowDot({ tipo, prompts, row }) {
  const p = prompts[tipo];
  if (hasPendingChanges(p)) {
    return <span className="status-dot status-dot--inline status-dot--orange" title="Cambios pendientes de guardar" />;
  }
  const hasBody = Boolean(p?.body?.trim());
  if (!hasBody) {
    return <span className="status-dot status-dot--inline status-dot--gray" title="Sin contenido" />;
  }
  if (row.status === "tipo_desconocido") {
    return <span className="status-dot status-dot--inline status-dot--orange" title="Tipo no catalogado" />;
  }
  return <span className="status-dot status-dot--inline status-dot--green" title="Sincronizado" />;
}
