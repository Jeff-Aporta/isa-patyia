import { getReact, getMaterialUI } from "../core/platform.ts";
import { searchPermisosUsers } from "../api/systemConfigApi.ts";
import { normalizePermisosUsername } from "./permisosKanbanShared.js";

const { useState, useEffect, useRef, useCallback } = getReact();
const { Autocomplete, TextField, Typography, Box } = getMaterialUI();

const DEBOUNCE_MS = 300;

function optionLabel(row) {
  if (!row) return "";
  return row.displayName ? `${row.displayName} (${row.username})` : row.username;
}

function usernameFromInput(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const paren = raw.match(/\(([A-Z0-9_.$-]+)\)\s*$/i);
  if (paren) return normalizePermisosUsername(paren[1]);
  return normalizePermisosUsername(raw.split(/\s+/)[0]);
}

/** Autocomplete de usuarios vía GET /api/system/permisos?search= (ISS). */
export function PermisosUserAutocomplete({ value, onChange, disabled = false, label = "Usuario", roleFilter = null, allowNew = true }) {
  const username = value ? normalizePermisosUsername(value) : null;
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const selected = username ? options.find((o) => o.username === username) ?? (username ? { username, displayName: null } : null) : null;

  const runSearch = useCallback(async (query) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    try {
      const users = await searchPermisosUsers(query, roleFilter ? { role: roleFilter } : undefined);
      if (id !== requestIdRef.current) return users;
      setOptions(users);
      return users;
    } catch {
      if (id === requestIdRef.current) setOptions([]);
      return [];
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, [roleFilter]);

  const scheduleSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { runSearch(query); }, DEBOUNCE_MS);
  }, [runSearch]);

  useEffect(() => {
    if (!username) { setInputValue(""); return; }
    if (value && username !== normalizePermisosUsername(value)) { onChange(username); return; }
    const match = options.find((o) => o.username === username);
    setInputValue(match ? optionLabel(match) : username);
  }, [value, username, options, onChange]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  useEffect(() => {
    if (disabled) return;
    runSearch("");
  }, [disabled, runSearch]);

  if (disabled) {
    return <TextField label={label} fullWidth size="small" value={username || ""} disabled placeholder="Sin usuario" />;
  }

  return (
    <Autocomplete
      fullWidth size="small" openOnFocus autoHighlight clearOnBlur={false} selectOnFocus handleHomeEndKeys
      freeSolo={allowNew} loading={loading} options={options} value={selected} inputValue={inputValue}
      filterOptions={(x) => x} getOptionLabel={optionLabel}
      isOptionEqualToValue={(a, b) => String(a?.username) === String(b?.username)}
      noOptionsText={loading ? "Buscando…" : "Sin coincidencias — escriba login"}
      loadingText="Buscando…"
      onOpen={() => { if (!options.length) runSearch(inputValue); }}
      onInputChange={(_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        scheduleSearch(text);
        if (allowNew) {
          const u = usernameFromInput(text);
          if (u && !text.includes("(")) onChange(u);
        }
      }}
      onChange={(_e, row) => {
        if (typeof row === "string") {
          const u = usernameFromInput(row);
          onChange(u);
          setInputValue(u ?? "");
          return;
        }
        onChange(row?.username ?? null);
        setInputValue(row ? optionLabel(row) : "");
      }}
      renderOption={(props, row) => (
        <Box component="li" {...props} key={row.username} sx={{ display: "flex", flexDirection: "column", py: 0.75 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.displayName || row.username}</Typography>
          {row.displayName ? <Typography variant="caption" color="text.secondary">{row.username}</Typography> : null}
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Buscar login ISS…"
          helperText={allowNew ? "Usuarios en permisos ISS o login nuevo" : "Usuarios registrados en permisos ISS"} />
      )}
    />
  );
}
