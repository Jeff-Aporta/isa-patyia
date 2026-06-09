const { useRef, useEffect } = React;

/** Editor JSON con CodeMirror 5 (CDN). Editable, numeración de líneas, scroll interno. */
function JsonCodeEditor({ value = "", onChange, placeholder = "" }) {
  const hostRef = useRef(null);
  const cmRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const syncingRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof CodeMirror === "undefined") return undefined;

    const cm = CodeMirror(host, {
      value: value || "",
      mode: { name: "javascript", json: true },
      theme: "dracula",
      lineNumbers: true,
      lineWrapping: false,
      tabSize: 2,
      indentUnit: 2,
      indentWithTabs: false,
      extraKeys: {
        Tab: (editor) => editor.replaceSelection("  ", "end"),
      },
    });

    cmRef.current = cm;

    cm.on("change", () => {
      if (syncingRef.current) return;
      onChangeRef.current?.(cm.getValue());
    });

    return () => {
      const wrapper = cm.getWrapperElement();
      wrapper?.parentNode?.removeChild(wrapper);
      cmRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    const cur = cm.getValue();
    const next = value ?? "";
    if (cur !== next) {
      syncingRef.current = true;
      const scroll = cm.getScrollInfo();
      const cursor = cm.getCursor();
      cm.setValue(next);
      cm.scrollTo(scroll.left, scroll.top);
      if (next) cm.setCursor(cursor);
      syncingRef.current = false;
    }
  }, [value]);

  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    const onResize = () => cm.refresh();
    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (typeof CodeMirror === "undefined") {
    return (
      <textarea
        className="json-cm-fallback"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        spellCheck={false}
      />
    );
  }

  return <div className="json-cm-host" ref={hostRef} />;
}

window.PatyJsonEditor = { JsonCodeEditor };
