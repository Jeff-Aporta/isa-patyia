/** Fondo y padding del hilo de conversación (mismo criterio que tkDocSurface en jagudeloe). */
const CONV_LOG_GRADIENT = {
  background: (t: { palette: { mode: string } }) =>
    t.palette.mode === "dark"
      ? "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(99,102,241,0.18), transparent 55%), linear-gradient(180deg, #0b1220 0%, #0f172a 100%)"
      : "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(30,144,255,0.12), transparent 55%), linear-gradient(180deg, #f0f6ff 0%, #f8fafc 100%)",
};

const CONV_LOG_PAD = { p: { xs: 1.25, sm: 2, md: 3 } };

export function convLogSurfaceSx(extra: Record<string, unknown> = {}) {
  return {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    ...CONV_LOG_GRADIENT,
    ...CONV_LOG_PAD,
    ...extra,
  };
}
