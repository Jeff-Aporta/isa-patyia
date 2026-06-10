/**
 * Estado de la app en query ?s= (JSON → base64url).
 */
(function (global) {
  "use strict";

  const PARAM = "s";
  const STATE_VERSION = 1;
  const MAX_B64_LEN = 12000;
  const WRITE_MS = 350;

  let state = { v: STATE_VERSION, tool: "log", local: false, log: {}, prompts: {} };
  let writeTimer = null;

  function encodeState(obj) {
    const json = JSON.stringify(obj);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decodeState(b64url) {
    let b64 = String(b64url).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  }

  function normalizePrompts(raw) {
    if (!raw || typeof raw !== "object") return {};
    const bodies = raw.bodies && typeof raw.bodies === "object" ? raw.bodies : {};
    const draftTipos = Array.isArray(raw.draftTipos)
      ? raw.draftTipos.map((t) => String(t).toUpperCase()).filter(Boolean)
      : Object.keys(bodies).map((t) => String(t).toUpperCase());
    return {
      ...raw,
      bodies,
      draftTipos,
    };
  }

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object") return state;
    return {
      v: raw.v ?? STATE_VERSION,
      tool: raw.tool === "prompts" ? "prompts" : "log",
      local: !!raw.local,
      log: raw.log && typeof raw.log === "object" ? raw.log : {},
      prompts: normalizePrompts(raw.prompts),
    };
  }

  function getSnapshot() {
    return JSON.parse(JSON.stringify(state));
  }

  function slimForUrl(src) {
    const slim = { ...src };
    if (slim.log?.jsonInput && String(slim.log.jsonInput).length > 4000) {
      slim.log = { convId: slim.log.convId || "" };
    }
    if (slim.prompts?.bodies) {
      const bodies = {};
      let total = 0;
      for (const [k, v] of Object.entries(slim.prompts.bodies)) {
        const t = String(v ?? "");
        if (total + t.length > 6000) break;
        bodies[k] = t;
        total += t.length;
      }
      slim.prompts = { ...slim.prompts, bodies };
    }
    return slim;
  }

  function updateUrl() {
    try {
      let enc = encodeState(state);
      if (enc.length > MAX_B64_LEN) {
        enc = encodeState(slimForUrl(state));
      }
      if (enc.length > MAX_B64_LEN) return;
      const url = new URL(location.href);
      url.searchParams.set(PARAM, enc);
      history.replaceState({ patyAppState: true }, "", url);
    } catch (e) {
      console.warn("PatyUrlState: no se pudo escribir ?s=", e);
    }
  }

  function scheduleWrite() {
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(updateUrl, WRITE_MS);
  }

  function mergePartial(partial) {
    state = {
      ...state,
      ...partial,
      log: { ...state.log, ...(partial.log || {}) },
      prompts: { ...state.prompts, ...(partial.prompts || {}) },
    };
    scheduleWrite();
    return getSnapshot();
  }

  function init() {
    try {
      const raw = new URLSearchParams(location.search).get(PARAM);
      if (raw) state = normalizeState(decodeState(raw));
    } catch (e) {
      console.warn("PatyUrlState: ?s= inválido", e);
    }
    if (global.PatyAppConfig && state.local !== global.PatyAppConfig.isLocalMode()) {
      global.PatyAppConfig.setLocalMode(state.local);
    }
    return getSnapshot();
  }

  const bootState = init();

  global.PatyUrlState = {
    PARAM,
    bootState,
    getSnapshot,
    mergePartial,
    flushToUrl: updateUrl,
  };
})(window);
