import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import { parseJwtClaims, jwtUserDisplayName, shortDisplayName } from "../../core/patyia-jwt.ts";
import { fetchTercerosAudit } from "../../api/apiClient.ts";
import { fetchPortalJwtCatalog } from "../../api/portalJwtApi.ts";
import { TERCEROS_AUDIT_PAGE_SIZE } from "./constants.ts";
import { auditScopeKey, formatAuditTs } from "./auditScope.ts";

const { useState, useEffect } = getReact();
const {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Divider,
} = getMaterialUI();
const { Icon } = UI;

function catalogDisplayName(entry) {
  const claims = entry.claims || {};
  const full = jwtUserDisplayName(claims);
  if (full) return shortDisplayName(full);
  return entry.username;
}

export function TercerosAuditDialog({ open, onClose, jwt, sessionUser, canAdminJwt, onSelect, currentScope }) {
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [jwtCatalog, setJwtCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    if (!open || !canAdminJwt) {
      setJwtCatalog([]);
      setCatalogError("");
      return undefined;
    }
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError("");
    fetchPortalJwtCatalog()
      .then((res) => { if (!cancelled) setJwtCatalog(res.entries ?? []); })
      .catch((err) => {
        if (!cancelled) {
          setJwtCatalog([]);
          setCatalogError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => { if (!cancelled) setCatalogLoading(false); });
    return () => { cancelled = true; };
  }, [open, canAdminJwt]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [qDebounced, open]);

  useEffect(() => {
    if (!open) return undefined;
    const claims = jwt?.token
      ? (jwt.claims?.itercero ? jwt.claims : (parseJwtClaims(jwt.token) || {}))
      : {};
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchTercerosAudit({
      page,
      limit: TERCEROS_AUDIT_PAGE_SIZE,
      q: qDebounced,
      jwtTercero: claims.itercero,
      jwtContacto: claims.icontacto,
      jwtNombre: jwt?.token ? jwtUserDisplayName(claims) : undefined,
      appUser: sessionUser || undefined,
    })
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, page, qDebounced, jwt?.token, jwt?.claims?.itercero, jwt?.claims?.icontacto, sessionUser]);

  const currentKey = auditScopeKey(currentScope);
  const rows = data?.rows ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper" className="paty-chat-terceros-dialog">
      <DialogTitle sx={{ pb: 1.25 }}>
        Filtrar por usuario
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1.5 }}>
        {canAdminJwt ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
              JWT en BD (admin)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Activa el token portal de otro usuario para chatear como ese contacto InSoft.
            </Typography>
            {catalogError ? <Alert severity="warning" sx={{ mb: 1 }}>{catalogError}</Alert> : null}
            {catalogLoading ? (
              <Box sx={{ py: 1.5, textAlign: "center" }}><CircularProgress size={22} /></Box>
            ) : (
              <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                {jwtCatalog.map((entry) => {
                  const active = jwt?.actingAsUsername === entry.username
                    || (!jwt?.actingAsUsername && sessionUser?.toUpperCase() === entry.username && jwt?.token);
                  const label = catalogDisplayName(entry);
                  const sub = entry.claims?.itercero
                    ? `${entry.claims.itercero} · ${entry.claims.icontacto ?? ""}`
                    : entry.username;
                  return (
                    <Button
                      key={entry.username}
                      size="small"
                      variant={active ? "contained" : "outlined"}
                      onClick={() => onSelect({ activateJwtOwner: entry.username, nombre: label })}
                      sx={{
                        textTransform: "none",
                        borderColor: active ? undefined : "rgba(124,58,237,0.45)",
                        color: active ? undefined : "#6d28d9",
                      }}
                    >
                      <Stack alignItems="flex-start" spacing={0}>
                        <span>{label}</span>
                        <Typography component="span" variant="caption" sx={{ opacity: 0.85 }}>
                          {sub}
                        </Typography>
                      </Stack>
                    </Button>
                  );
                })}
                {!catalogLoading && !jwtCatalog.length && !catalogError ? (
                  <Typography variant="caption" color="text.secondary">Sin JWT guardados en BD.</Typography>
                ) : null}
              </Stack>
            )}
            <Divider sx={{ my: 1.5 }} />
          </Box>
        ) : null}
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar tercero o contacto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ mb: 1.5 }}
          InputProps={{
            startAdornment: <Icon icon="mdi:magnify" size={18} style={{ marginRight: 6, opacity: 0.6 }} />,
          }}
        />
        {error ? <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert> : null}
        {loading ? (
          <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress size={28} /></Box>
        ) : (
          <TableContainer className="paty-chat-terceros-table">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre / tercero</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell align="right">Convs</TableCell>
                  <TableCell align="right">Msgs</TableCell>
                  <TableCell>Última act.</TableCell>
                  <TableCell align="center">Ver</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const key = `${row.itercero}|${row.icontacto}`;
                  const selected = currentKey === key;
                  return (
                    <TableRow
                      key={key}
                      hover
                      selected={selected}
                      className={row.es_jwt ? "paty-chat-terceros-row--jwt" : undefined}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Box sx={{ minWidth: 0 }}>
                            {row.nombre ? (
                              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
                                {shortDisplayName(row.nombre)}
                                {" "}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: 400,
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {row.itercero}
                                </Typography>
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', letterSpacing: "0.02em" }}
                              >
                                {row.itercero}
                              </Typography>
                            )}
                          </Box>
                          {row.es_jwt ? <Chip size="small" label="JWT" color="primary" sx={{ height: 20 }} /> : null}
                          {row.es_sesion ? <Chip size="small" label="Sesión" color="success" sx={{ height: 20 }} /> : null}
                        </Stack>
                      </TableCell>
                      <TableCell>{row.icontacto}</TableCell>
                      <TableCell align="right">{row.total_conversaciones.toLocaleString("es-CO")}</TableCell>
                      <TableCell align="right">{row.total_mensajes.toLocaleString("es-CO")}</TableCell>
                      <TableCell>{formatAuditTs(row.ultima_actividad)}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => onSelect({
                            itercero: row.itercero,
                            icontacto: row.icontacto,
                            esJwt: row.es_jwt,
                            esSesion: row.es_sesion,
                            nombre: row.nombre ? shortDisplayName(row.nombre) : null,
                          })}
                        >
                          {selected ? "Activo" : (row.es_sesion ? "Mis convs" : "Ver")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!loading && !rows.length ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      Sin resultados{qDebounced ? ` para “${qDebounced}”` : ""}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 2, py: 1.25 }}>
        <Typography variant="caption" color="text.secondary">
          {data ? `${data.total.toLocaleString("es-CO")} contactos · pág. ${data.page}/${Math.max(data.pages, 1)}` : "—"}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            disabled={loading || !data || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            startIcon={<Icon icon="mdi:chevron-left" size={18} />}
          >
            Anterior
          </Button>
          <Button
            size="small"
            disabled={loading || !data || page >= (data.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            endIcon={<Icon icon="mdi:chevron-right" size={18} />}
          >
            Siguiente
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
