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

function registerJsonFoldHelper() {
  const CM = window.CodeMirror;
  if (!CM?.registerHelper || !CM?.fold?.brace) return;
  try {
    CM.registerHelper("fold", "javascript", CM.fold.brace);
  } catch {
    /* ya registrado */
  }
}

function buildCmOptions({ value, json, mode, readOnly, lineWrapping, lineNumbers }) {
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
    viewportMargin: readOnly ? Infinity : 10,
    extraKeys,
  };

  if (json && window.CodeMirror?.fold?.gutter) {
    registerJsonFoldHelper();
    opts.gutters = ["CodeMirror-linenumbers", "CodeMirror-foldgutter"];
    opts.foldGutter = true;
    opts.extraKeys = {
      ...extraKeys,
      "Ctrl-Q": (cm) => cm.foldCode(cm.getCursor()),
      "Ctrl-Shift-Q": (cm) => cm.unfoldAll(),
    };
  }

  return opts;
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
  placeholder = "",
  lineWrapping = false,
  lineNumbers = true,
}) {
  const { Tooltip, IconButton } = getMaterialUI();
  const cmReady = useCodeMirrorReady();
  const hostRef = useRef(null);
  const cmRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const syncingRef = useRef(false);

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
    }));

    if (!readOnly && typeof onChange === "function") {
      cm.on("change", () => {
        if (syncingRef.current) return;
        onChangeRef.current?.(cm.getValue(), cm);
      });
    }

    cmRef.current = cm;
    const onResize = () => cm.refresh?.();
    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 0);
    const t2 = setTimeout(onResize, 120);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      const wrapper = cm.getWrapperElement?.();
      wrapper?.parentNode?.removeChild(wrapper);
      cmRef.current = null;
    };
  }, [cmReady, json, mode, readOnly, lineWrapping, lineNumbers]);

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
  }, [value, readOnly]);

  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    const t = setTimeout(() => cm.refresh(), 0);
    const t2 = setTimeout(() => cm.refresh(), 150);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [minHeight, maxHeight, fill, cmReady]);

  const panelClass = ["isa-cm-panel", fill ? "isa-cm-panel--fill" : "", className].filter(Boolean).join(" ");
  const hostStyle = { minHeight };
  if (maxHeight) hostStyle.maxHeight = maxHeight;

  if (!cmReady || typeof window.CodeMirror === "undefined") {
    if (cmReady) {
      const fallbackClass = readOnly ? "isa-cm-fallback" : "isa-cm-fallback json-cm-fallback";
      return (
        <div className={panelClass} style={{ minHeight }}>
          {readOnly ? (
            <pre className={fallbackClass} style={{ margin: 0, ...hostStyle }}>{value || placeholder}</pre>
          ) : (
            <textarea
              className={fallbackClass}
              style={{ ...hostStyle, width: "100%" }}
              value={value}
              placeholder={placeholder}
              spellCheck={false}
              onChange={(e) => onChange?.(e.target.value)}
            />
          )}
        </div>
      );
    }
    return <div className={panelClass} style={{ minHeight, ...hostStyle }} aria-hidden />;
  }

  return (
    <div className={panelClass}>
      <div className="isa-cm-panel__toolbar">
        <Tooltip title={copyTitle}>
          <IconButton
            size="small"
            className="isa-cm-panel__copy"
            aria-label={copyTitle}
            onClick={() => copyText(cmRef.current?.getValue?.() ?? value)}
          >
            <iconify-icon icon="mdi:content-copy" width="1.1em" height="1.1em" />
          </IconButton>
        </Tooltip>
      </div>
      <div className="isa-cm-host" ref={hostRef} style={hostStyle} />
    </div>
  );
}

/** Panel CodeMirror local (JSON con plegado, SQL, etc.). */
export function CodeMirrorPanel(props) {
  return <LocalCodeMirrorPanel {...props} />;
}
