import { getReact, getMaterialUI } from "../core/runtime.ts";

const { useRef, useEffect, useState } = getReact();

function resolveMode({ json, mode }) {
  if (json) return { name: "javascript", json: true };
  if (mode === "sql") return "text/x-sql";
  return mode || "javascript";
}

function useCodeMirrorReady() {
  const [ready, setReady] = useState(() => typeof window.CodeMirror !== "undefined");
  useEffect(() => {
    if (ready) return undefined;
    let cancelled = false;
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      if (typeof window.CodeMirror !== "undefined") {
        setReady(true);
        return;
      }
      tries += 1;
      if (tries < 50) setTimeout(tick, 40);
    };
    tick();
    return () => { cancelled = true; };
  }, [ready]);
  return ready;
}

function jsonFoldAvailable() {
  const CM = window.CodeMirror;
  return !!(CM?.fold?.brace && typeof CM.prototype?.foldCode === "function");
}

function registerJsonFoldHelper() {
  const CM = window.CodeMirror;
  if (!CM?.registerHelper || !CM?.fold?.brace) return;
  const foldFn = CM.fold.auto || CM.fold.brace;
  try {
    CM.registerHelper("fold", "javascript", foldFn);
  } catch {
    /* ya registrado */
  }
}

function unfoldAllJson(cm) {
  if (!cm) return;
  if (typeof cm.unfoldAll === "function") {
    cm.unfoldAll();
    return;
  }
  window.CodeMirror?.commands?.unfoldAll?.(cm);
}

/** Iconify en gutter fold (CodeMirror 5 no admite HTML en indicadores nativos). */
const FOLD_GUTTER_ICONS = { open: "mdi:chevron-down", folded: "mdi:chevron-right", size: 16 };

function decorateFoldGutterIcons(cm) {
  const root = cm?.getWrapperElement?.();
  if (!root) return;
  root.querySelectorAll(".CodeMirror-foldgutter-open, .CodeMirror-foldgutter-folded").forEach((el) => {
    const iconName = el.classList.contains("CodeMirror-foldgutter-open")
      ? FOLD_GUTTER_ICONS.open
      : FOLD_GUTTER_ICONS.folded;
    let node = el.querySelector("iconify-icon");
    if (!node) {
      el.textContent = "";
      node = document.createElement("iconify-icon");
      node.setAttribute("width", String(FOLD_GUTTER_ICONS.size));
      node.setAttribute("height", String(FOLD_GUTTER_ICONS.size));
      el.appendChild(node);
    }
    if (node.getAttribute("icon") !== iconName) node.setAttribute("icon", iconName);
  });
}

function attachFoldGutterIcons(cm) {
  decorateFoldGutterIcons(cm);
  cm.on("viewportChange", decorateFoldGutterIcons);
  cm.on("update", decorateFoldGutterIcons);
}

function buildCmOptions({ value, json, mode, readOnly, lineWrapping, lineNumbers, bounded = false }) {
  const extraKeys = readOnly
    ? {}
    : { Tab: (editor) => editor.replaceSelection("  ", "end") };

  const opts = {
    value: value || "",
    mode: resolveMode({ json, mode }),
    theme: "dracula",
    lineNumbers,
    lineWrapping,
    readOnly,
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: false,
    viewportMargin: readOnly && !bounded ? Infinity : 10,
    extraKeys,
  };

  if (json && jsonFoldAvailable()) {
    const CM = window.CodeMirror;
    registerJsonFoldHelper();
    opts.gutters = ["CodeMirror-linenumbers", "CodeMirror-foldgutter"];
    opts.foldGutter = { rangeFinder: CM.fold.brace };
    opts.extraKeys = {
      ...extraKeys,
      "Ctrl-Q": (cm) => cm.foldCode(cm.getCursor()),
      "Ctrl-Shift-Q": (cm) => unfoldAllJson(cm),
    };
  }

  return opts;
}

function syncCmFillSize(cm, host) {
  if (!cm || !host) return;
  const h = host.clientHeight;
  if (h > 0) {
    cm.setSize(null, h);
    cm.refresh();
  }
}

function parseCssLength(value, fallback = 160) {
  if (value == null || value === "") return fallback;
  const s = String(value).trim();
  if (s.endsWith("rem")) return parseFloat(s) * 16;
  if (s.endsWith("px")) return parseFloat(s);
  if (s.endsWith("dvh") || s.endsWith("vh")) return (parseFloat(s) / 100) * window.innerHeight;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

function syncCmBoundedSize(cm, maxHeight, host, minHeight) {
  if (!cm || !maxHeight) return;
  const minH = parseCssLength(minHeight ?? "5rem", 80);
  const maxH = parseCssLength(maxHeight, 160);
  const h = Math.max(maxH, minH);
  const wrap = cm.getOption?.("lineWrapping") === true;

  const chain = [
    host?.closest?.(".isa-cm-panel--bounded"),
    host?.closest?.(".isa-cm-editor-surface--bounded"),
    host,
  ].filter(Boolean);

  for (const el of chain) {
    el.style.height = `${h}px`;
    el.style.maxHeight = String(maxHeight);
    if (minHeight) el.style.minHeight = String(minHeight);
    el.style.overflow = "hidden";
  }

  const wrapper = cm.getWrapperElement?.();
  if (wrapper) {
    wrapper.style.height = `${h}px`;
    wrapper.style.maxHeight = `${h}px`;
    wrapper.style.overflow = "hidden";
  }

  const scroller = cm.getScrollerElement?.();
  if (scroller) {
    scroller.style.height = `${h}px`;
    scroller.style.maxHeight = `${h}px`;
    scroller.style.overflowY = "auto";
    scroller.style.overflowX = wrap ? "hidden" : "auto";
  }

  cm.setSize(null, h);
  cm.refresh();
}

async function copyText(text) {
  const s = String(text ?? "");
  if (!s) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(s);
      window.ISAFront?.toastSuccess?.("Copiado al portapapeles");
      return;
    }
  } catch {
    /* fallback */
  }
  const ta = document.createElement("textarea");
  ta.value = s;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    window.ISAFront?.toastSuccess?.("Copiado al portapapeles");
  } catch {
    /* ignore */
  }
  document.body.removeChild(ta);
}

function LocalCodeMirrorPanel({
  value = "",
  onChange,
  readOnly = true,
  json = false,
  mode,
  minHeight = "8rem",
  maxHeight,
  fill = false,
  className = "",
  copyTitle = "Copiar",
  fullPageTitle = "Editor",
  enableFullPage = false,
  placeholder = "",
  lineWrapping = false,
  lineNumbers = true,
  toolbarExtra = null,
}) {
  const { Tooltip, IconButton, Dialog, DialogTitle, DialogContent, Box } = getMaterialUI();
  const cmReady = useCodeMirrorReady();
  const [fullOpen, setFullOpen] = useState(false);
  const hostRef = useRef(null);
  const cmRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const syncingRef = useRef(false);
  const showJsonFold = json && jsonFoldAvailable();
  const showFloatingToolbar = enableFullPage || showJsonFold || copyTitle || !!toolbarExtra;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!cmReady) return undefined;
    const host = hostRef.current;
    if (!host || typeof window.CodeMirror === "undefined") return undefined;

    const cm = window.CodeMirror(host, buildCmOptions({
      value,
      json,
      mode,
      readOnly,
      lineWrapping,
      lineNumbers,
      bounded: !!maxHeight && !fill,
    }));

    if (!readOnly && typeof onChange === "function") {
      cm.on("change", () => {
        if (syncingRef.current) return;
        onChangeRef.current?.(cm.getValue(), cm);
      });
    }

    cmRef.current = cm;
    if (json && jsonFoldAvailable()) {
      attachFoldGutterIcons(cm);
      requestAnimationFrame(() => cm.refresh());
    }
    const onResize = () => {
      if (fill) syncCmFillSize(cm, host);
      else if (maxHeight) syncCmBoundedSize(cm, maxHeight, host, minHeight);
      else cm.refresh?.();
    };
    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 0);
    const t2 = setTimeout(onResize, 120);
    const t3 = setTimeout(onResize, 320);
    const t4 = maxHeight ? setTimeout(onResize, 520) : undefined;

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      clearTimeout(t3);
      if (t4) clearTimeout(t4);
      window.removeEventListener("resize", onResize);
      const wrapper = cm.getWrapperElement?.();
      wrapper?.parentNode?.removeChild(wrapper);
      cmRef.current = null;
    };
  }, [cmReady, json, mode, readOnly, lineWrapping, lineNumbers, fill, maxHeight, minHeight]);

  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    const next = value ?? "";
    if (cm.getValue() === next) return;
    syncingRef.current = true;
    const scroll = cm.getScrollInfo();
    const cursor = cm.getCursor();
    cm.setValue(next);
    cm.scrollTo(scroll.left, scroll.top);
    if (next && !readOnly) cm.setCursor(cursor);
    syncingRef.current = false;
    if (maxHeight && !fill) syncCmBoundedSize(cm, maxHeight, hostRef.current, minHeight);
  }, [value, readOnly, maxHeight, fill]);

  useEffect(() => {
    const cm = cmRef.current;
    const host = hostRef.current;
    if (!cm || !host) return undefined;

    const sync = () => {
      if (fill) syncCmFillSize(cm, host);
      else if (maxHeight) syncCmBoundedSize(cm, maxHeight, host, minHeight);
      else cm.refresh();
    };

    sync();
    const t = setTimeout(sync, 0);
    const t2 = setTimeout(sync, 150);

    if (!fill || typeof ResizeObserver === "undefined") {
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }

    const ro = new ResizeObserver(() => sync());
    ro.observe(host);
    const panel = host.closest?.(".isa-cm-panel--fill");
    if (panel && panel !== host) ro.observe(panel);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, [minHeight, maxHeight, fill, cmReady, value]);

  const panelClass = [
    "isa-cm-panel",
    fill ? "isa-cm-panel--fill" : "",
    maxHeight ? "isa-cm-panel--bounded" : "",
    showFloatingToolbar ? "isa-cm-panel--toolbar" : "",
    className,
  ].filter(Boolean).join(" ");
  const hostStyle = fill
    ? { minHeight: 0, height: "100%", flex: "1 1 auto" }
    : { minHeight };
  if (maxHeight) hostStyle.maxHeight = maxHeight;
  const panelStyle = fill
    ? { minHeight: 0, height: "100%", flex: "1 1 auto" }
    : { minHeight, ...(maxHeight ? { maxHeight } : {}) };

  function renderFloatingToolbar(getValue) {
    if (!showFloatingToolbar) return null;
    return (
      <div className="isa-cm-panel__toolbar" aria-label="Acciones del editor">
        {toolbarExtra}
        {enableFullPage && (
          <Tooltip title="Ver a pantalla completa">
            <IconButton
              size="small"
              className="isa-cm-panel__fab"
              aria-label="Pantalla completa"
              onClick={() => setFullOpen(true)}
            >
              <iconify-icon icon="mdi:fullscreen" width="14" height="14" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={copyTitle}>
          <IconButton
            size="small"
            className="isa-cm-panel__fab"
            aria-label={copyTitle}
            onClick={() => copyText(getValue())}
          >
            <iconify-icon icon="mdi:content-copy" width="14" height="14" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  function renderEditorSurface({ fallback = false } = {}) {
    const surfaceClass = "isa-cm-editor-surface" + (maxHeight ? " isa-cm-editor-surface--bounded" : "");
    const hostClass = "isa-cm-host" + (showJsonFold ? " isa-cm-host--fold" : "");
    const surfaceStyle = fill
      ? { flex: "1 1 auto", minHeight: 0, height: "100%" }
      : (maxHeight ? { maxHeight, minHeight, overflow: "hidden" } : undefined);
    const getValue = () => (fallback ? value : (cmRef.current?.getValue?.() ?? value));

    if (fallback) {
      const fallbackClass = readOnly ? "isa-cm-fallback" : "isa-cm-fallback json-cm-fallback";
      return (
        <div className={surfaceClass} style={surfaceStyle || hostStyle}>
          {renderFloatingToolbar(getValue)}
          {readOnly ? (
            <pre
              className={fallbackClass}
              style={{
                margin: 0,
                flex: 1,
                minHeight: 0,
                overflow: "auto",
                ...(maxHeight ? { maxHeight } : {}),
              }}
            >
              {value || placeholder}
            </pre>
          ) : (
            <textarea
              className={fallbackClass}
              style={{ flex: 1, minHeight: 0, width: "100%" }}
              value={value}
              placeholder={placeholder}
              spellCheck={false}
              onChange={(e) => onChange?.(e.target.value)}
            />
          )}
        </div>
      );
    }

    return (
      <div className={surfaceClass} style={surfaceStyle}>
        {renderFloatingToolbar(getValue)}
        <div className={hostClass} ref={hostRef} style={hostStyle} />
      </div>
    );
  }

  function renderFullPageDialog() {
    if (!enableFullPage) return null;
    return (
      <Dialog open={fullOpen} onClose={() => setFullOpen(false)} fullScreen scroll="paper">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            py: 1,
            px: 2,
          }}
        >
          <Box component="span" sx={{ fontWeight: 600, fontSize: "1rem" }}>{fullPageTitle}</Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={copyTitle}>
              <IconButton
                size="small"
                aria-label={copyTitle}
                onClick={() => copyText(cmRef.current?.getValue?.() ?? value)}
              >
                <iconify-icon icon="mdi:content-copy" width="1.1em" height="1.1em" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cerrar">
              <IconButton size="small" aria-label="Cerrar" onClick={() => setFullOpen(false)}>
                <iconify-icon icon="mdi:close" width="14" height="14" />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1, display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          <LocalCodeMirrorPanel
            value={value}
            onChange={onChange}
            json={json}
            mode={mode}
            readOnly={readOnly}
            fill
            lineWrapping={lineWrapping}
            lineNumbers={lineNumbers}
            copyTitle={copyTitle}
            enableFullPage={false}
            placeholder={placeholder}
            toolbarExtra={toolbarExtra}
            className="isa-cm-panel--dialog"
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (!cmReady || typeof window.CodeMirror === "undefined") {
    if (cmReady) {
      return (
        <>
          <div className={panelClass} style={panelStyle}>
            {renderEditorSurface({ fallback: true })}
          </div>
          {renderFullPageDialog()}
        </>
      );
    }
    return <div className={panelClass} style={panelStyle} aria-hidden />;
  }

  return (
    <>
      <div className={panelClass} style={panelStyle}>
        {renderEditorSurface()}
      </div>
      {renderFullPageDialog()}
    </>
  );
}

/** Panel CodeMirror local (JSON con plegado, SQL, etc.). */
export function CodeMirrorPanel(props) {
  return <LocalCodeMirrorPanel {...props} />;
}
