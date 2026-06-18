import { getReact, getReactDOM } from "../core/platform.ts";
import { mergePartial, bootState, getSnapshot, hrefFor } from "../core/urlState.ts";
import { UI } from "../core/platform.ts";
import { LoginButton } from "../auth/LabAuth.jsx";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";
import { ChatTool } from "../tools/ChatTool.jsx";
import { TodosTool } from "../tools/TodosTool.jsx";
import { Session } from "../core/platform.ts";
import { Assets } from "../core/platform.ts";

const BRAND_HOME_EVENT = "isa:brand-home";
const SCRUM_CAP = "patyia.scrum";

const ALL_TOOLS = [
  { id: "log", label: "Logs", icon: "mdi:clipboard-text-clock-outline" },
  { id: "prompts", label: "Prompts", icon: "mdi:database-export" },
  { id: "chat", label: "Chat", icon: "mdi:chat-outline" },
  { id: "todos", label: "Scrum", icon: "mdi:view-column" },
];

function canAccessScrum() {
  return Session.can(SCRUM_CAP);
}

function scrumTabMeta() {
  const allowed = canAccessScrum();
  return {
    disabled: !allowed,
    disabledTitle: allowed ? "" : "En desarrollo",
  };
}

export function App() {
  const { useState, useEffect } = getReact();
  const boot = bootState;
  const [appBoot, setAppBoot] = useState(boot);
  const [tool, setTool] = useState(boot.tool || "log");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [homeTick, setHomeTick] = useState(0);

  useEffect(() => {
    Assets.ensureMarked().catch(() => { /* fallback plaintext en mdToHtml */ });
  }, []);

  useEffect(() => {
    if (tool === "chat") Assets.ensureChatStagingCss();
    if (tool === "todos") Assets.ensureTodosCss();
  }, [tool]);

  useEffect(() => {
    function onAuth() { setAuthTick((n) => n + 1); }
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, []);

  useEffect(() => {
    if (tool === "todos" && !canAccessScrum()) {
      setTool("log");
      mergePartial({ tool: "log" });
    }
  }, [tool, authTick]);

  useEffect(() => {
    function onBrandHome() {
      setAppBoot(getSnapshot());
      setTool("log");
      setHomeTick((n) => n + 1);
    }
    window.addEventListener(BRAND_HOME_EVENT, onBrandHome);
    return () => window.removeEventListener(BRAND_HOME_EVENT, onBrandHome);
  }, []);

  const tools = ALL_TOOLS.map((t) => (t.id === "todos" ? { ...t, ...scrumTabMeta() } : t));

  function selectTool(id) {
    if (id === "todos" && !canAccessScrum()) return;
    setTool(id);
    mergePartial({ tool: id });
  }

  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado — revisar loader.mjs");

  return (
    <Shell
      ns="ISA"
      showTarget={false}
      navRows={[
        { id: "tool", value: tool, onChange: selectTool, tabs: tools, tabHref: (id) => hrefFor({ tool: id }) },
      ]}
      toolbarEnd={(
        <LoginButton
          loginOpen={authOpen}
          onLoginOpenChange={setAuthOpen}
          onLoggedIn={() => setAuthTick((n) => n + 1)}
        />
      )}
    >
      {tool === "log" && <LogViewer key={homeTick} bootLog={appBoot.log || {}} />}
      {tool === "prompts" && (
        <PromptsSqlTool key={homeTick} bootPrompts={appBoot.prompts || {}} onNeedLogin={() => setAuthOpen(true)} />
      )}
      {tool === "chat" && (
        <ChatTool key={homeTick} bootChat={appBoot.chat || {}} onNeedLogin={() => setAuthOpen(true)} />
      )}
      {tool === "todos" && canAccessScrum() && (
        <TodosTool key={homeTick} bootTodos={appBoot.todos || {}} onNeedLogin={() => setAuthOpen(true)} />
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
