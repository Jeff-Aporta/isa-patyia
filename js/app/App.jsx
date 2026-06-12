import { getReact, getReactDOM, getMaterialUI } from "../core/runtime.ts";
import { getLabTargetLabel } from "../core/config.ts";
import { mergePartial, bootState } from "../core/urlState.ts";
import { UI } from "../core/platform.ts";
import { NotificationProvider } from "../ui/notifications.jsx";
import { LabAuthModal, SessionActions } from "../auth/LabAuth.jsx";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";

const TOOLS = [
  { id: "log", title: "Visor de log", icon: "mdi:clipboard-text-clock-outline" },
  { id: "prompts", title: "Prompts → SQL", icon: "mdi:database-export" },
];

function ToolTabs({ tool, onSelect }) {
  const { Stack, Tooltip, ToggleButton, ToggleButtonGroup } = getMaterialUI();
  const { Icon } = UI;
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={tool}
      onChange={(_e, v) => { if (v) onSelect(v); }}
      sx={{ mr: 1 }}
    >
      {TOOLS.map((t) => (
        <ToggleButton key={t.id} value={t.id} aria-label={t.title} sx={{ px: 1.25, gap: 0.5 }}>
          <Tooltip title={t.title} arrow>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon icon={t.icon} size={18} />
              <span className="isa-tool-tab-label">{t.title}</span>
            </span>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function App() {
  const { useState, useEffect } = getReact();
  const { Box, Typography } = getMaterialUI();
  const boot = bootState;
  const [tool, setTool] = useState(boot.tool || "log");
  const [authOpen, setAuthOpen] = useState(false);
  const [, tickSession] = useState(0);
  const [targetLabel, setTargetLabel] = useState(getLabTargetLabel());

  useEffect(() => {
    const onAuth = () => tickSession((n) => n + 1);
    const onTarget = () => setTargetLabel(getLabTargetLabel());
    window.addEventListener("isa-patyia:auth", onAuth);
    window.addEventListener("jeff:gateway-target", onTarget);
    window.addEventListener("patyia-apptools:lab-target", onTarget);
    return () => {
      window.removeEventListener("isa-patyia:auth", onAuth);
      window.removeEventListener("jeff:gateway-target", onTarget);
      window.removeEventListener("patyia-apptools:lab-target", onTarget);
    };
  }, []);

  function selectTool(id) {
    setTool(id);
    mergePartial({ tool: id });
  }

  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado — revisar loader.ts y front-shared");

  return (
    <NotificationProvider>
      <Shell
        ns="ISA"
        title="PatyIA AppTools"
        icon="mdi:flask-outline"
        showAuthChip={false}
        showLogout={false}
        toolbarExtra={(
          <>
            <ToolTabs tool={tool} onSelect={selectTool} />
            <SessionActions onLoginClick={() => setAuthOpen(true)} />
          </>
        )}
      >
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 1, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            API · <code>{targetLabel}</code>
          </Typography>
        </Box>
        <Box className="isa-main" sx={{ p: { xs: 1, sm: 2 }, flex: 1, minHeight: 0, overflow: "auto" }}>
          {tool === "log" && <LogViewer bootLog={boot.log} />}
          {tool === "prompts" && (
            <PromptsSqlTool bootPrompts={boot.prompts} onNeedLogin={() => setAuthOpen(true)} />
          )}
        </Box>
      </Shell>
      <LabAuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLoggedIn={() => tickSession((n) => n + 1)} />
    </NotificationProvider>
  );
}

export function mountApp() {
  const { createRoot } = getReactDOM();
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("No se encontró #root");
  createRoot(rootEl).render(getReact().createElement(App));
}
