import { getReact, getMaterialUI, getReactDOM, UI, Session, Assets } from "../core/platform.ts";
import { mergePartial, bootState, getSnapshot, hrefFor, subscribe } from "../core/urlState.ts";
import { LogViewer } from "../tools/LogViewer.jsx";
import { PromptsSqlTool } from "../tools/PromptsSqlTool.jsx";
import { ChatTool } from "../tools/ChatTool.jsx";
import { TodosTool } from "../tools/TodosTool.jsx";
import { ConfigTool } from "../tools/ConfigTool.jsx";
import * as SessionApi from "../api/sessionApi.ts";

const { Stack, Tooltip, IconButton, Chip, Box } = getMaterialUI();

const BRAND_HOME_EVENT = "isa:brand-home";

/** ponytail: DevFlow fuera del nav hasta estabilizar kanban/SCRUM. */
const DEVFLOW_NAV_ENABLED = false;

const ALL_TOOLS = [
  { id: "log", label: "Logs", icon: "mdi:clipboard-text-clock-outline", cap: "canViewLogs" },
  { id: "prompts", label: "Prompts", icon: "mdi:database-export", cap: "canViewPrompts" },
  { id: "chat", label: "Chat", icon: "mdi:chat-outline", cap: "canViewChat" },
  { id: "todos", label: "DevFlow", icon: "mdi:view-column", cap: null, devflow: true },
  { id: "config", label: "Config", icon: "mdi:cog-outline", cap: "canViewConfig" },
];

// Vista pública Scrum/DevFlow: en ese modo la pestaña "todos" es la única útil.
const PUBLIC_SCRUM_TOOLS = [
  { id: "todos", label: "DevFlow", icon: "mdi:view-column" },
];

function isPublicScrumBoot(todos) {
  return !!String(todos?.publicSlug ?? "").trim();
}

function LocalIssBadge() {
  const { Icon } = UI;
  return (
    <Tooltip title="ISS local (127.0.0.1:8802)">
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
        <Chip
          size="small"
          color="warning"
          variant="outlined"
          icon={<Icon icon="mdi:laptop" size={16} />}
          label="Local"
          sx={{ height: 28, cursor: "default", pointerEvents: "none", "& .MuiChip-label": { px: 0.75 } }}
        />
      </Box>
    </Tooltip>
  );
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

  /** Tabs visibles: DevFlow oculto temporalmente; el resto siempre en nav (permisos en cada tool). */
  const visibleToolTabs = ALL_TOOLS.filter((t) => {
    if (t.devflow) return DEVFLOW_NAV_ENABLED;
    if (publicScrumView) return false;
    return true;
  });

  useEffect(() => {
    if (publicScrumView) return;
    if (!DEVFLOW_NAV_ENABLED && tool === "todos") {
      const fallback = visibleToolTabs[0]?.id || "log";
      setTool(fallback);
      mergePartial({ tool: fallback });
    }
  }, [publicScrumView, tool, authTick]);

  /** Si la tool actual no es visible → redirigir a la primera visible. */
  useEffect(() => {
    if (publicScrumView) return;
    if (!visibleToolTabs.length) return;
    const stillVisible = visibleToolTabs.some((t) => t.id === tool);
    if (!stillVisible) {
      const fallback = visibleToolTabs[0].id;
      setTool(fallback);
      mergePartial({ tool: fallback });
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
      {Session.isLoggedIn() ? (
        <Tooltip title="Cerrar sesión" arrow>
          <IconButton
            size="small"
            color="inherit"
            aria-label="Cerrar sesión"
            onClick={() => {
              SessionApi.logout();
              setAuthTick((n) => n + 1);
              window.dispatchEvent(new Event("isa-patyia:auth"));
            }}
          >
            <UI.Icon icon="mdi:logout" size={20} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );

  return (
    <Shell
      ns="ISA"
      title="PatyIA"
      showTarget={false}
      mobileBreakpoint="xs"
      chromeless={publicScrumView}
      toolbarExtra={toolbarTools}
      navRows={publicScrumView ? [
        { id: "tool", tier: "primary", value: tool, onChange: selectTool, tabs: PUBLIC_SCRUM_TOOLS, tabHref: (id) => hrefFor({ tool: id }) },
      ] : [
        { id: "tool", tier: "primary", value: tool, onChange: selectTool, tabs: visibleToolTabs, tabHref: (id) => hrefFor({ tool: id }) },
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
          {tool === "todos" && DEVFLOW_NAV_ENABLED && (
            <TodosTool key={`${homeTick}-${authTick}`} bootTodos={appBoot.todos || {}} onNeedLogin={() => setAuthOpen(true)} />
          )}
          {tool === "config" && (
            <ConfigTool key={homeTick} onNeedLogin={() => setAuthOpen(true)} />
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
