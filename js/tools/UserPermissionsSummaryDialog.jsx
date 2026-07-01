/**
 * Modal glass-neon — solo lectura — resumen de permisos efectivos de un usuario.
 *
 * Datos: se compone en cliente a partir de `roles[]` y `users[]` ya cargados por el panel,
 * replicando la misma mecánica del backend (roles directos + herencia por path + mergePermisos).
 * Sin requests adicionales; sin exponer JPERMISOS crudos.
 */

import { getMaterialUI, getReact } from "../core/platform.ts";
import { userRoles } from "./permisosForm.js";
import { ancestorsFromPath, getRoleJerarquia } from "./roleHierarchy.js";
import { roleTitleFromEntry } from "./permisosKanbanShared.js";
import { GlassDialog, GlassDialogHeader, glassDialogContentSx, glassDialogActionsSx } from "../ui/GlassDialog.jsx";

const { Typography, Stack, Box, Chip, Divider, CircularProgress } = getMaterialUI();
const { useMemo } = getReact();

const ROLE_KEYS_OMIT = new Set(["descripcion", "namedisplay", "roles", "jerarquia", "accent", "color", "icon", "all_permissions"]);

function getRoleEntry(roles, roleName) {
    const key = String(roleName ?? "").trim().toLowerCase();
    return (roles ?? []).find((r) => String(r?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "") === key) ?? null;
}

function activeRoles(roles) {
    return (roles ?? []).filter((r) => r?.itipo !== "user" && r?.bactivo !== false);
}

function chainForRole(roles, roleName) {
    const entry = getRoleEntry(roles, roleName);
    if (!entry) return { name: roleName, jerarquia: null, ancestors: [] };
    const jerarquia = getRoleJerarquia(roleName, entry.permisos);
    const ancestorPaths = ancestorsFromPath(jerarquia).slice(1);
    const ancestors = ancestorPaths
        .map((p) => ({ jerarquia: p, entry: getRoleEntry(roles, p) }))
        .filter((a) => a.entry && a.entry.bactivo !== false);
    return { name: roleName, jerarquia, ancestors };
}

function permissionValue(v) {
    if (v === true) return "allow";
    if (v && typeof v === "object") {
        if (Array.isArray(v.fixFilter)) {
            return { kind: "fixFilter", value: v.fixFilter };
        }
        if (v.fixFilter && typeof v.fixFilter === "object") {
            return { kind: "fixFilter", value: v.fixFilter };
        }
        return { kind: "object", value: v };
    }
    return { kind: "other", value: v };
}

function summarizePerms(perms) {
    const allows = [];
    const fixFilters = [];
    const others = [];
    for (const [k, v] of Object.entries(perms ?? {})) {
        if (ROLE_KEYS_OMIT.has(k)) continue;
        if (k.startsWith("__") || k === "*") {
            if (k === "*" && v === true) allows.unshift("*");
            continue;
        }
        const pv = permissionValue(v);
        if (pv === "allow") allows.push(k);
        else if (pv.kind === "fixFilter") fixFilters.push({ key: k, filter: pv.value });
        else others.push({ key: k, value: pv.value });
    }
    return { allows, fixFilters, others };
}

function ChipChain({ chain, roles }) {
    return (
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
            {chain.ancestors.map((anc) => (
                <Box key={anc.jerarquia} sx={{ display: "inline-flex", alignItems: "center" }}>
                    <Chip size="small" variant="outlined" label={roleTitleFromEntry(anc.entry) || anc.entry.iusuario} sx={{ fontFamily: "monospace", fontSize: 11 }} title={`Jerarquía ${anc.jerarquia}`} />
                    <Box component="span" sx={{ mx: 0.5, opacity: 0.6 }}>›</Box>
                </Box>
            ))}
            <Chip
                size="small"
                color="primary"
                label={roleTitleFromEntry(getRoleEntry(roles, chain.name)) || chain.name}
                sx={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}
                title={`Jerarquía ${chain.jerarquia}`}
            />
        </Stack>
    );
}

function RoleCard({ chain, roles }) {
    return (
        <Box className="isa-glass-card paty-permisos-summary__role" sx={{ p: 1.25, borderRadius: 1.5 }}>
            <Stack spacing={0.75}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="subtitle2" fontWeight={700} title={`${chain.name} · jerarquía ${chain.jerarquia}`}>
                        {chain.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                        {chain.jerarquia}
                    </Typography>
                </Stack>
                <ChipChain chain={chain} roles={roles} />
            </Stack>
        </Box>
    );
}

function PermList({ title, items, kind }) {
    if (!items.length) return null;
    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                {title} ({items.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {items.slice(0, kind === "fixFilter" ? 50 : 100).map((it, i) => {
                    if (kind === "fixFilter") {
                        const ffSummary = Object.entries(it.filter ?? {})
                            .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                            .join(", ");
                        return (
                            <Chip
                                key={`${it.key}-${i}`}
                                size="small"
                                variant="outlined"
                                color="warning"
                                label={`${it.key} · ${ffSummary}`}
                                title={`${it.key} — restringido a: ${ffSummary}`}
                                sx={{ fontFamily: "monospace", fontSize: 11 }}
                            />
                        );
                    }
                    if (kind === "allow") {
                        return (
                            <Chip
                                key={it}
                                size="small"
                                color="success"
                                variant="outlined"
                                label={it}
                                title={it}
                                sx={{ fontFamily: "monospace", fontSize: 11 }}
                            />
                        );
                    }
                    return (
                        <Chip
                            key={`${it.key}-${i}`}
                            size="small"
                            variant="outlined"
                            label={`${it.key} → ${JSON.stringify(it.value)}`}
                            title={it.key}
                            sx={{ fontFamily: "monospace", fontSize: 11 }}
                        />
                    );
                })}
                {items.length > (kind === "fixFilter" ? 50 : 100) ? (
                    <Chip size="small" label={`+${items.length - (kind === "fixFilter" ? 50 : 100)} más`} sx={{ fontFamily: "monospace", fontSize: 11 }} />
                ) : null}
            </Box>
        </Box>
    );
}

export function UserPermissionsSummaryDialog({ open, onClose, username, users, roles }) {
    const data = useMemo(() => {
        if (!open || !username) return null;
        const targetUser = (users ?? []).find((u) => String(u?.iusuario ?? "").trim().toUpperCase() === username.toUpperCase());
        if (!targetUser) return null;
        const active = activeRoles(roles);
        const directRoles = userRoles(targetUser.permisos);
        const chains = directRoles.map((rn) => chainForRole(active, rn));
        const { allows, fixFilters, others } = summarizePerms(targetUser.permisos);
        return { targetUser, chains, activeRoles: active, allows, fixFilters, others };
    }, [open, username, users, roles]);

    return (
        <GlassDialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            paperClassName="permisos-user-summary-dialog"
            header={
                <GlassDialogHeader
                    icon="mdi:shield-account-outline"
                    title={`Resumen de permisos — ${username || ""}`}
                    subtitle="Solo lectura · composición en cliente · incluye cadena de roles y permisos efectivos"
                    accent="#1e90ff"
                    onClose={onClose}
                />
            }
        >
            <Box sx={{ ...glassDialogContentSx(), minHeight: 360 }}>
                {!username ? (
                    <Typography color="text.secondary">Sin usuario seleccionado.</Typography>
                ) : !data ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <CircularProgress size={20} />
                        <Typography color="text.secondary">Usuario no encontrado en los datos cargados.</Typography>
                    </Stack>
                ) : (
                    <>
                        <Box>
                            <Typography variant="overline" color="text.secondary">Usuario</Typography>
                            <Typography variant="h6" fontWeight={700}>{data.targetUser.iusuario}</Typography>
                            {data.targetUser.permisos?.nombre || data.targetUser.permisos?.namedisplay ? (
                                <Typography variant="body2" color="text.secondary">
                                    {data.targetUser.permisos.nombre || data.targetUser.permisos.namedisplay}
                                </Typography>
                            ) : null}
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Typography variant="overline" color="text.secondary">
                            Cadena de roles {data.chains.length ? `(${data.chains.length})` : ""}
                        </Typography>
                        {data.chains.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                El usuario no tiene roles asignados. Permisos efectivos = visitante por defecto.
                            </Typography>
                        ) : (
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                {data.chains.map((c) => (
                                    <RoleCard key={c.name} chain={c} roles={data.activeRoles} />
                                ))}
                            </Stack>
                        )}

                        <Divider sx={{ my: 1.5 }} />

                        <Typography variant="overline" color="text.secondary">
                            Permisos efectivos del usuario
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            Calculados a partir de sus roles directos más la herencia por path jerárquico, replicando el merge del backend.
                        </Typography>

                        {data.allows.length === 0 && data.fixFilters.length === 0 && data.others.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Sin permisos materializados más allá del visitante por defecto.
                            </Typography>
                        ) : (
                            <>
                                <PermList title="Permitidos" items={data.allows} kind="allow" />
                                <PermList title="Con filtro fijo" items={data.fixFilters} kind="fixFilter" />
                                <PermList title="Otros" items={data.others} kind="other" />
                            </>
                        )}

                        <Divider sx={{ my: 1.5 }} />

                        <Typography variant="caption" color="text.secondary">
                            Los detalles completos por rol se obtienen al abrir cada columna en la jerarquía. Este resumen es de solo lectura y se actualiza al recargar el panel.
                        </Typography>
                    </>
                )}
            </Box>
            <Box sx={glassDialogActionsSx()}>
                <button
                    type="button"
                    className="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-colorPrimary"
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </Box>
        </GlassDialog>
    );
}
