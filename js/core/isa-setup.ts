/** Registra ISA PatyIA AppTools en ISAFront (front-shared). */
window.ISAFront.registerApp({
  ns: "ISA",
  app: "isa-patyia",
  theme: true,
  widgets: { targetStyle: "chip" },
  session: true,
  auth: false,
  /** Indicador en header sí; socket no hasta el módulo de chat. */
  realtime: {
    enabled: () => false,
    autoStart: false,
  },
  toast: true,
});

if (window.ISAFront?.registerCodeMirror && window.React && window.MaterialUI) {
  window.ISAFront.registerCodeMirror(window.React, window.MaterialUI);
}

if (!window.ISA?.Session) {
  throw new Error("No se pudo iniciar la aplicación. Recargue sin caché (Ctrl+Shift+R).");
}
