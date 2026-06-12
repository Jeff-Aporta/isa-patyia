/** Registra ISA PatyIA AppTools en ISAFront (front-shared). */
(function () {
  "use strict";
  window.ISAFront.registerApp({
    ns: "ISA",
    app: "isa-patyia",
    theme: { lsKey: "isa-patyia:theme" },
    widgets: { targetStyle: "switch" },
    session: true,
    auth: false,
    realtime: false,
    toast: true,
  });

  if (!window.ISA?.Session) {
    throw new Error(
      "ISA.Session no registrado — recargue sin caché (Ctrl+Shift+R). " +
        "Verifique front-shared en js/boot/loader.ts.",
    );
  }
})();
