/** Filtro ISS listados — query `f` = JSON en Base64 (ISS-AyudasCPIA/src/lib/filter). */

export const ISS_LIST_FILTER_QUERY_PARAM = "f";

/** Orden por defecto del listado de conversaciones (desc por iconversacion). */
export const CONVERSACIONES_LIST_SORT_DEFAULT = "-iconversacion";

export type IssListFilter = {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  eq?: Record<string, string | number | boolean>;
};

export function encodeIssListFilterB64(filter: IssListFilter | Record<string, unknown>): string {
  const json = JSON.stringify(filter);
  return btoa(unescape(encodeURIComponent(json)));
}

/** Preset conversacionesRecientes (swagger catalog). */
export function buildConversacionesListFilter(input: {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
} = {}): IssListFilter {
  const limit = Math.min(100, Math.max(1, Math.floor(Number(input.limit) || 10)));
  const offset = Math.max(0, Math.floor(Number(input.offset) || 0));
  const sort = String(input.sort || CONVERSACIONES_LIST_SORT_DEFAULT).trim() || CONVERSACIONES_LIST_SORT_DEFAULT;
  const search = String(input.search ?? "").trim().slice(0, 200);
  return {
    limit,
    offset,
    sort,
    ...(search ? { search } : {}),
  };
}

export function conversacionesListQueryParams(input: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  itercero?: string;
  icontacto?: string;
} = {}): URLSearchParams {
  const limit = Math.min(100, Math.max(1, Math.floor(Number(input.limit) || 10)));
  const page = Math.max(1, Math.floor(Number(input.page) || 1));
  const offset = (page - 1) * limit;
  const qs = new URLSearchParams();
  qs.set(ISS_LIST_FILTER_QUERY_PARAM, encodeIssListFilterB64(buildConversacionesListFilter({
    search: input.search,
    limit,
    offset,
    sort: input.sort,
  })));
  const itercero = String(input.itercero ?? "").trim();
  const icontacto = String(input.icontacto ?? "").trim();
  if (itercero && icontacto) {
    qs.set("itercero", itercero);
    qs.set("icontacto", icontacto);
  }
  return qs;
}
