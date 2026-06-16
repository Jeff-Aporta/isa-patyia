import { getReact, getReactDOM } from "../core/runtime.ts";
import { mergePartial, bootState } from "../core/urlState.ts";
import { UI } from "../core/platform.ts";
import { LoginButton } from "../auth/LabAuth.jsx";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";
import { ChatTool } from "../tools/ChatTool.jsx";
import { Session } from "../core/platform.ts";

const ALL_TOOLS = [
  { id: "log", label: "Logs", icon: "mdi:clipboard-text-clock-outline" },
  { id: "prompts", label: "Prompts", icon: "mdi:database-export" },
  { id: "chat", label: "Chat", icon: "mdi:chat-outline" },
];

export function App() {
  const { useState, useEffect } = getReact();
  const boot = bootState;
  const [tool, setTool] = useState(boot.tool || "log");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    function onAuth() { setAuthTick((n) => n + 1); }
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, []);

  const tools = ALL_TOOLS;

  function selectTool(id) {
    setTool(id);
    mergePartial({ tool: id });
  }

  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado — revisar loader.mjs");

  return (
    <Shell
      ns="ISA"
      title="ISA PatyIA"
      icon="mdi:robot-happy-outline"
      showTarget={false}
      navRows={[
        { id: "tool", value: tool, onChange: selectTool, tabs: tools },
      ]}
      toolbarEnd={(
        <LoginButton
          loginOpen={authOpen}
          onLoginOpenChange={setAuthOpen}
          onLoggedIn={() => setAuthTick((n) => n + 1)}
        />
      )}
    >
      {tool === "log" && <LogViewer bootLog={boot.log} />}
      {tool === "prompts" && (
        <PromptsSqlTool bootPrompts={boot.prompts} onNeedLogin={() => setAuthOpen(true)} />
      )}
      {tool === "chat" && (
        <ChatTool bootChat={boot.chat} onNeedLogin={() => setAuthOpen(true)} />
      )}
    </Shell>
  );
}

export function mountApp() {
  const { createRoot } = getReactDOM();
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("No se encontró #root");
  createRoot(rootEl).render(getReact().createElement(App));
}
