import { getMaterialUI } from "../core/platform.ts";

const { Autocomplete, TextField, Chip } = getMaterialUI();

export function PermisosRoleFilterAutocomplete({ options, value, onChange, disabled = false }) {
  const selected = options.filter((o) => value.includes(o.id));
  return (
    <Autocomplete
      multiple
      size="small"
      disabled={disabled}
      className="config-permisos-toolbar__field config-permisos-toolbar__field--role"
      options={options}
      value={selected}
      onChange={(_, next) => onChange(next.map((o) => o.id))}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      disableCloseOnSelect
      limitTags={2}
      renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return <Chip key={key} {...chipProps} label={option.label} size="small" className="isa-neon-glass-chip" />;
      })}
      renderInput={(params) => (
        <TextField {...params} label="Roles" placeholder={selected.length ? "" : "Todos"} />
      )}
    />
  );
}
