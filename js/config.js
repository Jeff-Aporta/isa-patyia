/**

 * Backend lab — local (:5500) u online (Azure).

 */

(function (global) {

  "use strict";

  /** Bump al publicar para evitar JS cacheado en GitHub Pages. */
  const APP_BUILD = "20260601-qa-f5";

  const LS_LOCAL = "isa-patyia:lab-local";

  const LAB_LOCAL = "http://localhost:5500";

  const LAB_ONLINE = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net";



  function isLocalMode() {

    try {

      return localStorage.getItem(LS_LOCAL) === "1";

    } catch (_) {

      return false;

    }

  }



  function setLocalMode(enabled) {

    try {

      localStorage.setItem(LS_LOCAL, enabled ? "1" : "0");

    } catch (_) { /* ignore */ }

    global.dispatchEvent(new Event("isa-patyia:lab-target"));

    return enabled;

  }



  function getLabBase() {

    return isLocalMode() ? LAB_LOCAL : LAB_ONLINE;

  }



  function getLabTargetLabel() {

    return isLocalMode() ? "local :5500" : "en línea";

  }



  global.PatyAppConfig = {

    APP_BUILD,

    getLabBase,

    isLocalMode,

    setLocalMode,

    getLabTargetLabel,

    LAB_LOCAL,

    LAB_ONLINE,

  };

})(window);


