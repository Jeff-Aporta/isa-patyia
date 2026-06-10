/**
 * Sesión lab por usuario + rol (BD_LANGLAB). Sin JWT en la UI.
 * Mutaciones usan token técnico INTEGRACIONES vía POST /auth/service-token.
 */
(function (global) {
  "use strict";

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith("patyia-apptools:")) localStorage.removeItem(k);
    }
  } catch (_) { /* migración desde prefijo patyia-apptools */ }

  const SS_KEY = "isa-patyia:lab-session";

  /** Capacidades por rol (espejo de lab-permissions.json). */
  const ROLE_CAPS = {
    admin: ["guardar_langlab", "ejecutar_mssql", "signalr"],
    instrucciones_editor: ["guardar_langlab"],
  };

  /** Excepciones por usuario (espejo de lab-permissions.json → user_exceptions). */
  /** Viviana (VRESTREPO): solo Guardar en langlab; sin ejecutar SQL staging. */
  const USER_CAPS = {
    VRESTREPO: ["guardar_langlab"],
  };

  const CAP_LABELS = {
    guardar_langlab: "guardar instrucciones",
    ejecutar_mssql: "ejecutar fusión SQL en PatyIA",
    ejecutar_mssql_instrucciones: "actualizar instrucciones en PatyIA",
    signalr: "conectar SignalR",
  };

  const CAP_ENDPOINTS = {
    guardar_langlab: { method: "POST", path: "/patyia/prompts/upsert-sql" },
    ejecutar_mssql: { method: "POST", path: "/mssql/paty/exec" },
    ejecutar_mssql_instrucciones: { method: "POST", path: "/mssql/paty/exec" },
    signalr: { method: "POST", path: "/signalr/negotiate" },
  };

  let serviceToken = null;
  let serviceExpMs = 0;

  function readSession() {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s?.username || !s?.sessionToken) return null;
      if (s.expiresAt && Date.now() >= new Date(s.expiresAt).getTime()) return null;
      return s;
    } catch (_) {
      return null;
    }
  }

  function writeSession(s) {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(s));
    } catch (_) { /* ignore */ }
    global.dispatchEvent(new Event("isa-patyia:auth"));
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SS_KEY);
    } catch (_) { /* ignore */ }
    serviceToken = null;
    serviceExpMs = 0;
    global.dispatchEvent(new Event("isa-patyia:auth"));
  }

  function capsForRole(role) {
    return ROLE_CAPS[String(role || "").trim()] || [];
  }

  function capsForUser(username) {
    return USER_CAPS[String(username || "").trim().toUpperCase()] || [];
  }

  function can(cap) {
    const s = readSession();
    if (!s) return false;
    if (capsForRole(s.role).includes(cap)) return true;
    return capsForUser(s.username).includes(cap);
  }

  function mssqlExecCap() {
    if (can("ejecutar_mssql")) return "ejecutar_mssql";
    if (can("ejecutar_mssql_instrucciones")) return "ejecutar_mssql_instrucciones";
    return null;
  }

  function blockReason(cap) {
    const label = CAP_LABELS[cap] || cap;
    const s = readSession();
    if (!s) return `Inicia sesión para ${label}`;
    if (!can(cap)) {
      return `Sin permiso para ${label}${s.role ? ` (rol: ${s.role})` : ""}`;
    }
    return "";
  }

  function sessionHeaders() {
    const s = readSession();
    if (!s?.sessionToken) return {};
    return { Authorization: `Bearer ${s.sessionToken}` };
  }

  function apiUrl(path) {
    const base = PatyAppConfig.getLabBase().replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}/api${p}`;
  }

  async function fetchServiceToken(cap) {
    const ep = CAP_ENDPOINTS[cap];
    if (!ep) throw new Error(`Capacidad desconocida: ${cap}`);
    if (serviceToken && serviceExpMs > Date.now() + 60_000) {
      return serviceToken;
    }
    const res = await fetch(apiUrl("/auth/service-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...sessionHeaders() },
      body: JSON.stringify({ method: ep.method, path: ep.path }),
    });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      throw new Error(text || res.statusText);
    }
    if (res.status === 403) {
      const err = new Error(data.error ?? "Permiso denegado");
      err.code = "FORBIDDEN";
      err.detail = data;
      throw err;
    }
    if (res.status === 404) {
      throw new Error(
        "El servidor no expone guardado de instrucciones. Contacta al administrador.",
      );
    }
    if (!res.ok || !data.token) {
      throw new Error(data.error ?? data.hint ?? res.statusText ?? "Token de servicio no disponible");
    }
    serviceToken = data.token;
    serviceExpMs = data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + 3_600_000;
    return serviceToken;
  }

  async function serviceAuthHeaders(cap) {
    const token = await fetchServiceToken(cap);
    return { Authorization: `Bearer ${token}` };
  }

  async function login(username, password) {
    const res = await fetch(apiUrl("/auth/token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const text = await res.text();
    let data = { ok: false };
    try {
      data = text ? JSON.parse(text) : { ok: false };
    } catch (_) {
      data = { ok: false, error: text || res.statusText };
    }
    if (!res.ok || !data.token) {
      const parts = [data.error, data.hint, data.detail].filter(Boolean);
      throw new Error(parts.join(" · ") || res.statusText || "Inicio de sesión fallido");
    }
    serviceToken = null;
    serviceExpMs = 0;
    const session = {
      username: data.username || username.trim().toUpperCase(),
      role: data.role || null,
      expiresAt: data.expiresAt || null,
      sessionToken: data.token,
    };
    if (!session.role) {
      try {
        const meRes = await fetch(apiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const me = await meRes.json();
        if (me.ok) session.role = me.role;
      } catch (_) { /* ignore */ }
    }
    writeSession(session);
    return session;
  }

  function logout() {
    clearSession();
  }

  function isLoggedIn() {
    return Boolean(readSession());
  }

  function getSession() {
    return readSession();
  }

  function handleApiError(err, cap) {
    if (err?.code === "FORBIDDEN" || /permiso|denegad/i.test(String(err?.message))) {
      PatyNotify.toastWarning(blockReason(cap) || String(err.message));
      return;
    }
    if (/401|sesión|expirad|no autorizado/i.test(String(err?.message))) {
      clearSession();
      PatyNotify.toastWarning("Sesión expirada. Vuelve a iniciar sesión.");
      return;
    }
    PatyNotify.toastError(err instanceof Error ? err.message : String(err));
  }

  global.PatyLabSession = {
    ROLE_CAPS,
    USER_CAPS,
    CAP_LABELS,
    login,
    logout,
    isLoggedIn,
    getSession,
    can,
    mssqlExecCap,
    blockReason,
    sessionHeaders,
    serviceAuthHeaders,
    handleApiError,
    clearSession,
  };
})(window);
