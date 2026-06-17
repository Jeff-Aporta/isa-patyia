import { getReact, getMaterialUI, Session } from "../../core/platform.ts";
import { savePatyJwtAsync } from "../../core/patyia-jwt.ts";
import { toastError, toastSuccess } from "../../core/platform.ts";

const { useState, useEffect } = getReact();
const {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} = getMaterialUI();

export function JwtModal({ open, onClose, initialToken, onSave }) {
  const [value, setValue] = useState(initialToken || "");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setValue(initialToken || ""); }, [open, initialToken]);

  async function submit() {
    try {
      const user = Session.username();
      if (!user) throw new Error("Inicia sesión en ISA PatyIA");
      setSaving(true);
      const rec = await savePatyJwtAsync(value, user);
      onSave(rec);
      toastSuccess("Token JWT guardado en tu cuenta");
      onClose();
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className="paty-chat-jwt-dialog">
      <DialogTitle>PatyIA</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          inputProps={{ spellCheck: false }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
