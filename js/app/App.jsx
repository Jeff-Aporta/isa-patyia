import { getReact, getReactDOM } from "../core/runtime.ts";
import { mergePartial, bootState } from "../core/urlState.ts";
import { NotificationProvider } from "../ui/notifications.jsx";
import { LoginButton } from "../auth/LabAuth.jsx";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";

const TOOLS = [
  { id: "log", label: "Visor de log", icon: "mdi:clipboard-text-clock-outline" },
  { id: "prompts", label: "Prompts → SQL", icon: "mdi:database-export" },
];

export function App() {
  const { useState } = getReact();
  const boot = bootState;
  const [tool, setTool] = useState(boot.tool || "log");
  const [authOpen, setAuthOpen] = useState(false);
  const [, tickSession] = useState(0);

  function selectTool(id) {
    setTool(id);
    mergePartial({ tool: id });
  }

  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado — revisar loader.ts");

  return (
    <NotificationProvider>
      <Shell
        ns="ISA"
        icon="mdi:flask-outline"
        showTitle={false}
        navRows={[
          { id: "tool", value: tool, onChange: selectTool, tabs: TOOLS },
        ]}
        toolbarEnd={(
          <LoginButton
            loginOpen={authOpen}
            onLoginOpenChange={setAuthOpen}
            onLoggedIn={() => tickSession((n) => n + 1)}
          />
        )}
      >
        {tool === "log" && <LogViewer bootLog={boot.log} />}
        {tool === "prompts" && (
          <PromptsSqlTool bootPrompts={boot.prompts} onNeedLogin={() => setAuthOpen(true)} />
        )}
      </Shell>
    </NotificationProvider>
  );
}

export function mountApp() {
  const { createRoot } = getReactDOM();
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("No se encontró #root");
  createRoot(rootEl).render(getReact().createElement(App));
}
