import { getReact, getMaterialUI } from "../../core/platform.ts";
import { searchScrumAppUsers } from "../../api/todosApi.ts";

const { useState, useEffect, useRef, useCallback } = getReact();
const { Autocomplete, TextField, Typography, Box } = getMaterialUI();

const DEBOUNCE_MS = 300;

function optionLabel(row) {
  if (!row) return "";
  return row.displayName ? `${row.displayName} (${row.username})` : row.username;
}

export function UserAssignAutocomplete({ value, onChange, disabled = false, label = "Asignado a" }) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const selected = value
    ? options.find((o) => o.username === value) ?? { username: value, displayName: null }
    : null;

  const runSearch = useCallback(async (query) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    try {
      const users = await searchScrumAppUsers(query, 12);
      if (id !== requestIdRef.current) return;
      setOptions(users);
    } catch {
      if (id === requestIdRef.current) setOptions([]);
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, []);

  const scheduleSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);
  }, [runSearch]);

  useEffect(() => {
    if (!value) {
      setInputValue("");
      return;
    }
    const match = options.find((o) => o.username === value);
    setInputValue(match ? optionLabel(match) : value);
  }, [value, options]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (disabled) return;
    runSearch("");
  }, [disabled, runSearch]);

  if (disabled) {
    return (
      <TextField
        label={label}
        fullWidth
        size="small"
        value={value || ""}
        disabled
        placeholder="Sin asignar"
      />
    );
  }

  return (
    <Autocomplete
      fullWidth
      size="small"
      openOnFocus
      autoHighlight
      clearOnBlur={false}
      loading={loading}
      options={options}
      value={selected}
      inputValue={inputValue}
      filterOptions={(x) => x}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(a, b) => String(a?.username) === String(b?.username)}
      noOptionsText={loading ? "Buscando…" : "Sin usuarios"}
      loadingText="Buscando…"
      onOpen={() => {
        if (!options.length) runSearch(inputValue);
      }}
      onInputChange={(_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        scheduleSearch(text);
      }}
      onChange={(_e, row) => {
        onChange(row?.username ?? null);
        setInputValue(row ? optionLabel(row) : "");
      }}
      renderOption={(props, row) => (
        <Box component="li" {...props} key={row.username} sx={{ display: "flex", flexDirection: "column", py: 0.75 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.displayName || row.username}
          </Typography>
          {row.displayName ? (
            <Typography variant="caption" color="text.secondary">{row.username}</Typography>
          ) : null}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Buscar integrante…"
          helperText="Usuarios con acceso a isa-patyia"
        />
      )}
    />
  );
}
