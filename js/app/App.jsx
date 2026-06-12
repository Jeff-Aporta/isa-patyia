import { getReact, getMaterialUI } from "../core/runtime.ts";
import {
  isLocalMode, setLocalMode, ORCH_LOCAL, LAB_LEGACY_ONLINE, getLabTargetLabel,
} from "../core/config.ts";
import { bootState, mergePartial } from "../core/urlState.ts";
import { theme } from "../ui/shared.jsx";
import { NotificationProvider } from "../ui/notifications.jsx";
import { LabAuthModal, SessionActions } from "../auth/LabAuth.jsx";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";

const TOOLS = [
  { id: "log", title: "Visor de log", icon: "mdi:clipboard-text-clock-outline" },
  { id: "prompts", title: "Prompts → SQL", icon: "mdi:database-export" },
];

function LabTargetSwitch() {
  const { useState, useEffect, useCallback } = getReact();
  const { Tooltip, Switch, FormControlLabel } = getMaterialUI();
  const [local, setLocal] = useState(isLocalMode());

  const refresh = useCallback(() => {
    setLocal(isLocalMode());
  }, []);

  useEffect(() => {
    window.addEventListener("patyia-apptools:lab-target", refresh);
    return () => window.removeEventListener("patyia-apptools:lab-target", refresh);
  }, [refresh]);

  function onChange(e) {
    const checked = e.target.checked;
    setLocalMode(checked);
    mergePartial({ local: checked });
    setLocal(checked);
  }

  const title = local
    ? `Peticiones al orquestador local (${ORCH_LOCAL})`
    : `Peticiones a lab Azure legacy (${LAB_LEGACY_ONLINE})`;

  return (
    <Tooltip title={title} arrow>
      <FormControlLabel
        className="lab-target-switch"
        control={
          <Switch
            size="small"
            checked={local}
            onChange={onChange}
            inputProps={{ "aria-label": title }}
          />
        }
        label={(
          <span className="lab-target-label">
            <iconify-icon icon={local ? "mdi:lan-connect" : "mdi:cloud-outline"} width="0.95em" height="0.95em" />
            <span>{local ? "orquestador" : "legacy"}</span>
          </span>
        )}
      />
    </Tooltip>
  );
}

export function App() {
  const { useState, useEffect } = getReact();
  const { ThemeProvider, CssBaseline, Stack, Typography, Tooltip } = getMaterialUI();
  const boot = bootState;
  const [tool, setTool] = useState(boot.tool || "log");
  const [authOpen, setAuthOpen] = useState(false);
  const [, tickSession] = useState(0);
  const [targetLabel, setTargetLabel] = useState(getLabTargetLabel());

  useEffect(() => {
    const onAuth = () => tickSession((n) => n + 1);
    const onTarget = () => setTargetLabel(getLabTargetLabel());
    window.addEventListener("patyia-apptools:auth", onAuth);
    window.addEventListener("patyia-apptools:lab-target", onTarget);
    return () => {
      window.removeEventListener("patyia-apptools:auth", onAuth);
      window.removeEventListener("patyia-apptools:lab-target", onTarget);
    };
  }, []);

  function selectTool(id) {
    setTool(id);
    mergePartial({ tool: id });
  }

  function onLoggedIn() {
    window.dispatchEvent(new Event("patyia-apptools:auth"));
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <div className="isa-app">
          <header className="isa-header">
            <div className="isa-header-top">
              <span className="isa-logo">PatyIA</span>
              <span className="isa-sep">|</span>
              <nav className="isa-nav isa-nav-tools">
                {TOOLS.map((t) => (
                  <Tooltip key={t.id} title={t.title} arrow>
                    <button
                      type="button"
                      className={`isa-nav-link isa-nav-link--icon${tool === t.id ? " active" : ""}`}
                      onClick={() => selectTool(t.id)}
                      aria-label={t.title}
                    >
                      <iconify-icon icon={t.icon} width="1.2em" height="1.2em" />
                    </button>
                  </Tooltip>
                ))}
              </nav>
              <div className="isa-header-actions">
                <Stack direction="row" spacing={0.5} alignItems="center" className="header-auth-wrap">
                  <LabTargetSwitch />
                  <SessionActions onLoginClick={() => setAuthOpen(true)} />
                </Stack>
              </div>
            </div>
            <nav className="isa-nav isa-nav-sub">
              <Typography variant="caption" color="text.secondary">
                AppTools · API · <code>{targetLabel}</code>
              </Typography>
            </nav>
          </header>

          <main className="isa-main">
            {tool === "log" && <LogViewer bootLog={boot.log} />}
            {tool === "prompts" && <PromptsSqlTool bootPrompts={boot.prompts} onNeedLogin={() => setAuthOpen(true)} />}
          </main>

          <LabAuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLoggedIn={onLoggedIn} />
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}
