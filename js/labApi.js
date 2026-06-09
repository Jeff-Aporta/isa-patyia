/**
 * Cliente lab: lectura pública; mutaciones vía sesión + rol + token INTEGRACIONES.
 */
(function (global) {
  "use strict";

  function requireBase() {
    const base = global.PatyAppConfig?.getLabBase?.() ?? "";
    if (!base) throw new Error("URL de lab no configurada.");
    return base.replace(/\/$/, "");
  }

  function apiUrl(path) {
    const base = requireBase();
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}/api${p}`;
  }

  function wrapFetchError(err, url) {
    if (err instanceof TypeError && /failed to fetch/i.test(String(err.message))) {
      return new Error(
        `No se pudo conectar con lab (${url}). Comprueba el switch local/en línea, ` +
          "que config.js tenga el host correcto y que /api/health responda.",
      );
    }
    return err instanceof Error ? err : new Error(String(err));
  }

  async function labFetchRaw(url, init = {}) {
    try {
      return await fetch(url, init);
    } catch (err) {
      throw wrapFetchError(err, url);
    }
  }

  async function parseJsonResponse(res) {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (_) {
      throw new Error(text || res.statusText);
    }
  }

  async function labFetch(path, init = {}, cap = null) {
    const url = apiUrl(path);
    const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
    const res = await labFetchRaw(url, { ...init, headers });
    const data = await parseJsonResponse(res);
    if (res.status === 403) {
      const err = new Error(data.error ?? "Permiso denegado");
      err.code = "FORBIDDEN";
      if (cap) PatyLabSession.handleApiError(err, cap);
      throw err;
    }
    if (res.status === 401) {
      PatyLabSession.clearSession();
      const err = new Error(data.error ?? data.hint ?? "Sesión no válida");
      if (cap) PatyNotify.toastWarning("Sesión expirada. Vuelve a iniciar sesión.");
      throw err;
    }
    if (res.status === 404) {
      throw new Error(
        `Ruta no encontrada en lab (${path}). Despliega la última versión de lab-langgraph.`,
      );
    }
    if (!res.ok || data.ok === false) {
      throw new Error(data.error ?? data.output ?? res.statusText ?? `HTTP ${res.status}`);
    }
    return data;
  }

  async function labFetchWithCap(cap, path, init = {}) {
    if (!PatyLabSession.can(cap)) {
      const msg = PatyLabSession.blockReason(cap);
      PatyNotify.toastWarning(msg);
      const err = new Error(msg);
      err.code = "NO_SESSION";
      throw err;
    }
    const auth = await PatyLabSession.serviceAuthHeaders(cap);
    return labFetch(path, { ...init, headers: { ...auth, ...(init.headers || {}) } }, cap);
  }

  async function mssqlQuery(sql) {
    const data = await labFetch("/mssql/paty/query", {
      method: "POST",
      body: JSON.stringify({ sql }),
    });
    const rows = data.rows ?? data.recordset ?? data.recordsets?.[0] ?? [];
    return { ...data, rows };
  }

  async function mssqlExec(sql) {
    const cap = PatyLabSession.mssqlExecCap();
    if (!cap) {
      const msg = PatyLabSession.blockReason("ejecutar_mssql_instrucciones")
        || PatyLabSession.blockReason("ejecutar_mssql");
      PatyNotify.toastWarning(msg);
      const err = new Error(msg);
      err.code = "NO_SESSION";
      throw err;
    }
    return labFetchWithCap(cap, "/mssql/paty/exec", {
      method: "POST",
      body: JSON.stringify({ sql }),
    });
  }

  async function pingLab() {
    return labFetch("/health", { method: "GET" });
  }

  async function pgLanglabExec(sql) {
    return labFetchWithCap("guardar_langlab", "/patyia/prompts/upsert-sql", {
      method: "POST",
      body: JSON.stringify({ sql, target: "langlab" }),
    });
  }

  async function savePromptsToLanglab(sql) {
    return pgLanglabExec(sql);
  }

  function rowVal(row, key) {
    if (!row || !key) return null;
    if (row[key] != null) return row[key];
    const lower = key.toLowerCase();
    if (row[lower] != null) return row[lower];
    const upper = key.toUpperCase();
    if (row[upper] != null) return row[upper];
    return null;
  }

  const SQL_INSTRUCCIONES = `SELECT [IINSTRUCCION],[NINSTRUCCION],[INSTRUCCION],[DESCRIPCION],[BACTIVO]
FROM [dbo].[INSTRUCCION]
WHERE [BACTIVO] = 1
ORDER BY [IINSTRUCCION]`;

  async function fetchInstruccionesPaty() {
    const { rows } = await mssqlQuery(SQL_INSTRUCCIONES);
    return rows ?? [];
  }

  async function fetchConvLogById(iconversacion) {
    const id = Number(iconversacion);
    if (!Number.isInteger(id) || id <= 0) throw new Error("iconversacion inválido");
    const sql = `SELECT CONTENT FROM dbo.CONVERSACION_LOG WHERE ICONVERSACION = ${id}`;
    const { rows } = await mssqlQuery(sql);
    const row = rows[0];
    const raw = row?.CONTENT ?? row?.content;
    if (!raw || typeof raw !== "string") {
      throw new Error(`Log conv-${id} no encontrado en CONVERSACION_LOG`);
    }
    const parsed = JSON.parse(raw.trim());
    if (!parsed || !Array.isArray(parsed.mensajes)) {
      throw new Error("CONTENT no es un log de conversación válido");
    }
    parsed.iconversacion = parsed.iconversacion || id;
    return parsed;
  }

  global.PatyLabApi = {
    requireBase,
    apiUrl,
    pingLab,
    labFetch,
    mssqlQuery,
    mssqlExec,
    pgLanglabExec,
    savePromptsToLanglab,
    rowVal,
    fetchInstruccionesPaty,
    fetchConvLogById,
  };
})(window);
