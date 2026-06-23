import { getReact, getMaterialUI, UI } from "../../core/platform.ts";

const { useState, useEffect, useRef, useCallback, useMemo } = getReact();
const { Autocomplete, TextField, Typography, Box, IconButton, InputAdornment } = getMaterialUI();
const { Icon } = UI;

const DEBOUNCE_MS = 300;

function convOptionLabel(row) {
  if (!row) return "";
  const title = String(row.titulo ?? "").trim() || "Sin título";
  return `${row.iconversacion} · ${title}`;
}

function convSelectedLabel(row) {
  if (!row?.iconversacion) return "";
  return String(row.iconversacion);
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

  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputValue("");
    onSearchChange?.("");
  }, [onSearchChange]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const showClear = Boolean(inputValue?.trim());

  return (
    <Autocomplete
      fullWidth
      size="small"
      className="paty-chat-conv-search"
      openOnFocus
      autoHighlight
      clearOnBlur={false}
      disableClearable
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
          setInputValue(convSelectedLabel(row));
        }
      }}
      renderOption={(props, row) => (
        <Box
          component="li"
          {...props}
          key={row.iconversacion}
          className="paty-chat-conv-search__option"
          sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", py: 0.75 }}
        >
          <Typography variant="body2" className="paty-chat-conv-search__option-label" sx={{ fontWeight: 600 }} noWrap>
            <Box component="span" className="paty-chat-conv-search__option-id">
              {row.iconversacion}
            </Box>
            <Box component="span" className="paty-chat-conv-search__option-sep">
              {" · "}
            </Box>
            <Box component="span" className="paty-chat-conv-search__option-title">
              {String(row.titulo ?? "").trim() || "Sin título"}
            </Box>
          </Typography>
        </Box>
      )}
      renderInput={(params) => {
        const inputSlot = params.slotProps?.input ?? {};
        return (
          <TextField
            {...params}
            placeholder={placeholder}
            slotProps={{
              ...params.slotProps,
              input: {
                ...inputSlot,
                endAdornment: (
                  <>
                    {showClear ? (
                      <InputAdornment position="end">
                        <IconButton size="small" aria-label="Limpiar búsqueda" className="paty-chat-conv-search__clear" onMouseDown={(e) => e.preventDefault()} onClick={clearSearch}>
                          <Icon icon="mdi:close" size={16} />
                        </IconButton>
                      </InputAdornment>
                    ) : null}
                    {inputSlot.endAdornment}
                  </>
                ),
              },
            }}
          />
        );
      }}
    />
  );
}
