import { getReact, getReactDOM } from "../core/platform.ts";
import { mergePartial, bootState, getSnapshot, hrefFor, subscribe } from "../core/urlState.ts";
import { UI } from "../core/platform.ts";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";
import { ChatTool } from "../tools/ChatTool.jsx";
import { TodosTool } from "../tools/TodosTool.jsx";
import { Session } from "../core/platform.ts";
import { Assets } from "../core/platform.ts";

const BRAND_HOME_EVENT = "isa:brand-home";

const ALL_TOOLS = [
  { id: "log", label: "Logs", icon: "mdi:clipboard-text-clock-outline" },
  { id: "prompts", label: "Prompts", icon: "mdi:database-export" },
  { id: "chat", label: "Chat", icon: "mdi:chat-outline" },
  { id: "todos", label: "DevFlow", icon: "mdi:view-column" },
];

function isPublicScrumBoot(todos) {
  return !!String(todos?.publicSlug ?? "").trim();
}

export function App() {
  const { useState, useEffect } = getReact();
  const { LoginButton } = UI;
  const boot = bootState;
  const [appBoot, setAppBoot] = useState(boot);
  const [tool, setTool] = useState(() => boot.tool || "log");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [homeTick, setHomeTick] = useState(0);
  const publicScrumView = isPublicScrumBoot(appBoot.todos);

  useEffect(() => {
    Assets.ensureMarked().catch(() => { /* fallback plaintext en mdToHtml */ });
  }, []);

  useEffect(() => {
    return subscribe(() => {
      const t = getSnapshot().tool || "log";
      setTool(t);
    });
  }, []);

  useEffect(() => {
    if (tool === "chat" || tool === "log") Assets.ensureChatStagingCss();
    if (tool === "todos" || publicScrumView) Assets.ensureTodosCss();
  }, [tool, publicScrumView]);

  useEffect(() => {
    if (publicScrumView) {
      document.documentElement.classList.add("paty-public-scrum");
    } else {
      document.documentElement.classList.remove("paty-public-scrum");
    }
    return () => document.documentElement.classList.remove("paty-public-scrum");
  }, [publicScrumView]);

  useEffect(() => {
    if (publicScrumView && tool !== "todos") {
      setTool("todos");
    }
  }, [publicScrumView, tool]);

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
    function onBrandHome() {
      setAppBoot(getSnapshot());
      setTool("log");
      setHomeTick((n) => n + 1);
    }
    window.addEventListener(BRAND_HOME_EVENT, onBrandHome);
    return () => window.removeEventListener(BRAND_HOME_EVENT, onBrandHome);
  }, []);

  function selectTool(id) {
    setTool(id);
    mergePartial({ tool: id });
  }

  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado — revisar loader.mjs");

  const toolbarTools = publicScrumView ? null : (
    <LoginButton
      loginOpen={authOpen}
      onLoginOpenChange={setAuthOpen}
      onLoggedIn={() => {
        setAuthTick((n) => n + 1);
        window.dispatchEvent(new Event("isa-patyia:auth"));
      }}
    />
  );

  return (
    <Shell
      ns="ISA"
      title="PatyIA"
      showTarget={false}
      mobileBreakpoint="xs"
      chromeless={publicScrumView}
      toolbarExtra={toolbarTools}
      navRows={publicScrumView ? [] : [
        { id: "tool", tier: "primary", value: tool, onChange: selectTool, tabs: ALL_TOOLS, tabHref: (id) => hrefFor({ tool: id }) },
      ]}
    >
      {publicScrumView ? (
        <TodosTool key={homeTick} bootTodos={appBoot.todos || {}} onNeedLogin={() => setAuthOpen(true)} />
      ) : (
        <>
          {tool === "log" && <LogViewer key={homeTick} bootLog={appBoot.log || {}} />}
          {tool === "prompts" && (
            <PromptsSqlTool key={homeTick} bootPrompts={appBoot.prompts || {}} onNeedLogin={() => setAuthOpen(true)} />
          )}
          {tool === "chat" && (
            <ChatTool key={homeTick} bootChat={getSnapshot().chat || {}} onNeedLogin={() => setAuthOpen(true)} />
          )}
          {tool === "todos" && (
            <TodosTool key={`${homeTick}-${authTick}`} bootTodos={appBoot.todos || {}} onNeedLogin={() => setAuthOpen(true)} />
          )}
        </>
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
