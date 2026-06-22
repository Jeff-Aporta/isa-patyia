import { getReact, getMaterialUI } from "../../core/platform.ts";
import { formatTs } from "./mensajesModel.ts";

const { useState, useEffect, useRef, useCallback, useMemo } = getReact();
const { Autocomplete, TextField, Typography, Box } = getMaterialUI();

const DEBOUNCE_MS = 300;

function convOptionLabel(row) {
  if (!row) return "";
  const title = String(row.titulo ?? "").trim() || "Sin título";
  return `${row.iconversacion} · ${title}`;
}

export function ConvSearchAutocomplete({
  rows = [],
  loading = false,
  search = "",
  onSearchChange,
  selectedId,
  onSelectConv,
  disabled = false,
  placeholder = "Buscar conversación…",
}) {
  const [inputValue, setInputValue] = useState(search ?? "");
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(search ?? "");
  }, [search]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((r) => Number(r.iconversacion) === Number(selectedId)) ?? null;
  }, [rows, selectedId]);

  const scheduleSearch = useCallback((text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange?.(text.trim()), DEBOUNCE_MS);
  }, [onSearchChange]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return (
    <Autocomplete
      fullWidth
      size="small"
      className="paty-chat-conv-search"
      openOnFocus
      autoHighlight
      clearOnBlur={false}
      disabled={disabled}
      loading={loading}
      options={rows}
      value={selected}
      inputValue={inputValue}
      filterOptions={(x) => x}
      getOptionLabel={convOptionLabel}
      isOptionEqualToValue={(a, b) => Number(a?.iconversacion) === Number(b?.iconversacion)}
      noOptionsText={loading ? "Buscando…" : "Sin conversaciones"}
      loadingText="Buscando…"
      onInputChange={(_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        scheduleSearch(text);
      }}
      onChange={(_e, row) => {
        if (row?.iconversacion) {
          onSelectConv?.(row.iconversacion);
          setInputValue(convOptionLabel(row));
        }
      }}
      renderOption={(props, row) => (
        <Box component="li" {...props} key={row.iconversacion} sx={{ display: "flex", flexDirection: "column", py: 0.75 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {convOptionLabel(row)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {`${formatTs(row.fhultact)} · ${row.qmensajes ?? 0} msgs`}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} />
      )}
    />
  );
}
