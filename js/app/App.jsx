import { getReact, getMaterialUI, getReactDOM, UI, Session, Assets } from "../core/platform.ts";
import { mergePartial, bootState, getSnapshot, hrefFor, subscribe } from "../core/urlState.ts";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";
import { ChatTool } from "../tools/ChatTool.jsx";
import { TodosTool } from "../tools/TodosTool.jsx";
import { ConfigTool } from "../tools/ConfigTool.jsx";
import { IssTargetChip } from "../components/IssTargetSwitch.jsx";
import { ViewAsRoleMenu } from "../components/ViewAsRoleControl.jsx";
import * as SessionApi from "../api/sessionApi.ts";

/** Mismo grafo que bootMeCaps — evita ViewAsRoleMenu en platform.js con cache ME vacío. */
(function registerViewAsRoleMenu() {
  const ui = window.ISA?.UI;
  if (!ui) return;
  ui.ViewAsRoleMenu = ViewAsRoleMenu;
  try { window.dispatchEvent(new Event("patyia-apptools:caps-changed")); } catch { /* ignore */ }
})();

const { Stack } = getMaterialUI();

const BRAND_HOME_EVENT = "isa:brand-home";

/** ponytail: DevFlow fuera del nav hasta estabilizar kanban/SCRUM. */
const DEVFLOW_NAV_ENABLED = false;

/** Tools del nav primario — Prompts y Logs viven como sub-tabs.
 * Nav siempre navegable; permisos restringen acciones/inputs dentro de cada panel. */
const ALL_TOOLS = [
  { id: "chat", label: "Chat", icon: "mdi:chat-outline" },
  { id: "todos", label: "DevFlow", icon: "mdi:view-column", devflow: true },
  { id: "config", label: "Config", icon: "mdi:cog-outline" },
];

/** Sub-nav de Chat: logs primero, luego conversaciones. */
const CHAT_PANES = [
  { id: "logs", label: "Logs", icon: "mdi:clipboard-text-clock-outline" },
  { id: "conv", label: "Conversaciones", icon: "mdi:forum-outline" },
];

/** Sub-nav de Config: prompts, sistema, permisos. */
const CONFIG_PANES = [
  { id: "prompts", label: "Prompts", icon: "mdi:database-export" },
  { id: "sistema", label: "Sistema", icon: "mdi:tune-vertical" },
  { id: "permisos", label: "Permisos", icon: "mdi:shield-key-outline" },
];

const PUBLIC_SCRUM_TOOLS = [
  { id: "todos", label: "DevFlow", icon: "mdi:view-column" },
];

function navTabs(tabs) {
  return tabs.map(({ id, label, icon }) => ({ id, label, icon }));
}

function isPublicScrumBoot(todos) {
  return !!String(todos?.publicSlug ?? "").trim();
}

function readChatPane(boot) {
  const pane = boot?.chat?.pane;
  if (pane === "logs" || pane === "conv") return pane;
  return "conv";
}

function readConfigPane(boot) {
  const pane = boot?.config?.pane;
  if (pane === "permisos" || pane === "prompts" || pane === "sistema") return pane;
  return "sistema";
}

function LocalIssBadge() {
  return <IssTargetChip />;
}

export function App() {
  const { useState, useEffect, useMemo } = getReact();
  const { LoginButton } = UI;
  const boot = bootState;
  const [appBoot, setAppBoot] = useState(boot);
  const [tool, setTool] = useState(() => boot.tool || "chat");
  const [chatPane, setChatPane] = useState(() => readChatPane(boot));
  const [configPane, setConfigPane] = useState(() => readConfigPane(boot));
  const [authOpen, setAuthOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [homeTick, setHomeTick] = useState(0);
  const publicScrumView = isPublicScrumBoot(appBoot.todos);

  useEffect(() => {
    Assets.ensureMarked().catch(() => { /* fallback plaintext en mdToHtml */ });
  }, []);

  useEffect(() => {
    return subscribe(() => {
      const snap = getSnapshot();
      setAppBoot(snap);
      setTool(snap.tool || "chat");
      setChatPane(readChatPane(snap));
      setConfigPane(readConfigPane(snap));
    });
  }, []);

  useEffect(() => {
    if (tool === "chat") Assets.ensureChatStagingCss();
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

  const toolTabs = useMemo(() => navTabs(ALL_TOOLS.filter((t) => {
    if (t.devflow) return DEVFLOW_NAV_ENABLED;
    if (publicScrumView) return false;
    return true;
  })), [publicScrumView]);
  const chatPanes = useMemo(() => navTabs(CHAT_PANES), []);
  const configPanes = useMemo(() => navTabs(CONFIG_PANES), []);

  useEffect(() => {
    if (publicScrumView) return;
    if (!DEVFLOW_NAV_ENABLED && tool === "todos") {
      setTool("chat");
      mergePartial({ tool: "chat" });
    }
  }, [publicScrumView, tool, authTick]);

  useEffect(() => {
    let alive = true;
    function onAuth() {
      if (!alive) return;
      setAuthTick((n) => n + 1);
      void SessionApi.bootMeCaps();
    }
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    window.addEventListener("patyia-apptools:caps-changed", onAuth);
    if (Session.isLoggedIn()) void SessionApi.bootMeCaps();
    return () => {
      alive = false;
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
      window.removeEventListener("patyia-apptools:caps-changed", onAuth);
    };
  }, []);

  useEffect(() => {
    function onBrandHome() {
      setAppBoot(getSnapshot());
      setTool("chat");
      setChatPane("conv");
      setHomeTick((n) => n + 1);
    }
    window.addEventListener(BRAND_HOME_EVENT, onBrandHome);
    return () => window.removeEventListener(BRAND_HOME_EVENT, onBrandHome);
  }, []);

  function selectTool(id) {
    setTool(id);
    if (id === "chat") {
      mergePartial({ tool: id, chat: { pane: chatPane || "conv" } });
    } else if (id === "config") {
      mergePartial({ tool: id, config: { pane: configPane || "sistema" } });
    } else {
      mergePartial({ tool: id });
    }
  }

  function selectChatPane(id) {
    const pane = id === "logs" ? "logs" : "conv";
    setChatPane(pane);
    setTool("chat");
    mergePartial({ tool: "chat", chat: { pane } });
  }

  function selectConfigPane(id) {
    const pane = id === "permisos" ? "permisos" : id === "prompts" ? "prompts" : "sistema";
    setConfigPane(pane);
    setTool("config");
    mergePartial({ tool: "config", config: { pane } });
    try { localStorage.setItem("isa-patyia:config-tab", pane); } catch { /* ignore */ }
  }

  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado — revisar loader.mjs");

  const toolbarTools = publicScrumView ? null : (
    <Stack direction="row" spacing={0.75} alignItems="center" className="header-session-wrap">
      <LocalIssBadge />
      <LoginButton
        loginOpen={authOpen}
        onLoginOpenChange={setAuthOpen}
        onLoggedIn={() => {
          setAuthTick((n) => n + 1);
          window.dispatchEvent(new Event("isa-patyia:auth"));
        }}
      />
    </Stack>
  );

  const navRows = publicScrumView
    ? [
        { id: "tool", tier: "primary", value: tool, onChange: selectTool, tabs: PUBLIC_SCRUM_TOOLS, tabHref: (id) => hrefFor({ tool: id }) },
      ]
    : [
        { id: "tool", tier: "primary", value: tool, onChange: selectTool, tabs: toolTabs, tabHref: (id) => hrefFor({ tool: id }) },
        ...(tool === "chat"
          ? [{
              id: "chat-pane",
              tier: "secondary",
              compact: true,
              value: chatPane,
              onChange: selectChatPane,
              tabs: chatPanes,
              tabHref: (id) => hrefFor({ tool: "chat", chat: { pane: id } }),
            }]
          : []),
        ...(tool === "config"
          ? [{
              id: "config-pane",
              tier: "secondary",
              compact: true,
              value: configPane,
              onChange: selectConfigPane,
              tabs: configPanes,
              tabHref: (id) => hrefFor({ tool: "config", config: { pane: id } }),
            }]
          : []),
      ];

  return (
    <Shell
      ns="ISA"
      title="PatyIA"
      showTarget={false}
      mobileBreakpoint="xs"
      chromeless={publicScrumView}
      toolbarExtra={toolbarTools}
      navRows={navRows}
    >
      {publicScrumView ? (
        <TodosTool key={homeTick} bootTodos={appBoot.todos || {}} onNeedLogin={() => setAuthOpen(true)} />
      ) : (
        <>
          {tool === "chat" && chatPane === "logs" && (
            <LogViewer key={`logs-${homeTick}`} bootLog={appBoot.log || getSnapshot().log || {}} />
          )}
          {tool === "chat" && chatPane !== "logs" && (
            <ChatTool key={homeTick} bootChat={getSnapshot().chat || {}} onNeedLogin={() => setAuthOpen(true)} />
          )}
          {tool === "todos" && DEVFLOW_NAV_ENABLED && (
            <TodosTool key={`${homeTick}-${authTick}`} bootTodos={appBoot.todos || {}} onNeedLogin={() => setAuthOpen(true)} />
          )}
          {tool === "config" && configPane === "prompts" && (
            <PromptsSqlTool key={homeTick} bootPrompts={appBoot.prompts || {}} onNeedLogin={() => setAuthOpen(true)} />
          )}
          {tool === "config" && (configPane === "permisos" || configPane === "sistema") && (
            <ConfigTool key={homeTick} pane={configPane} onNeedLogin={() => setAuthOpen(true)} />
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
