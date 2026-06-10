const { useState, useEffect, useCallback } = React;

const {

  ThemeProvider, CssBaseline, Stack, Typography, Tooltip, Switch, FormControlLabel,

} = MaterialUI;



const TOOLS = [

  { id: "log", title: "Visor de log", icon: "mdi:clipboard-text-clock-outline" },

  { id: "prompts", title: "Prompts → SQL", icon: "mdi:database-export" },

];



function LabTargetSwitch() {

  const [local, setLocal] = useState(PatyAppConfig.isLocalMode());



  const refresh = useCallback(() => {

    setLocal(PatyAppConfig.isLocalMode());

  }, []);



  useEffect(() => {

    window.addEventListener("isa-patyia:lab-target", refresh);

    return () => window.removeEventListener("isa-patyia:lab-target", refresh);

  }, [refresh]);



  function onChange(e) {

    const checked = e.target.checked;

    PatyAppConfig.setLocalMode(checked);

    PatyUrlState.mergePartial({ local: checked });

    setLocal(checked);

  }



  const title = local

    ? `Servidor local (${PatyAppConfig.LAB_LOCAL})`

    : `Servidor en línea (${PatyAppConfig.LAB_ONLINE})`;



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

            <span>{local ? "local" : "en línea"}</span>

          </span>

        )}

      />

    </Tooltip>

  );

}



function App() {

  const boot = PatyUrlState.bootState;

  const [tool, setTool] = useState(boot.tool || "log");

  const [authOpen, setAuthOpen] = useState(false);

  const [, tickSession] = useState(0);

  const [targetLabel, setTargetLabel] = useState(PatyAppConfig.getLabTargetLabel());



  useEffect(() => {

    const onAuth = () => tickSession((n) => n + 1);

    const onTarget = () => setTargetLabel(PatyAppConfig.getLabTargetLabel());

    window.addEventListener("isa-patyia:auth", onAuth);

    window.addEventListener("isa-patyia:lab-target", onTarget);

    return () => {

      window.removeEventListener("isa-patyia:auth", onAuth);

      window.removeEventListener("isa-patyia:lab-target", onTarget);

    };

  }, []);



  function selectTool(id) {

    setTool(id);

    PatyUrlState.mergePartial({ tool: id });

  }



  function onLoggedIn() {

    window.dispatchEvent(new Event("isa-patyia:auth"));

  }



  const { LogViewer } = PatyLogViewer;

  const { PromptsSqlTool } = PatyPromptsSqlTool;

  const { LabAuthModal, SessionActions } = PatyLabAuth;

  const { NotificationProvider } = PatyNotifications;

  return (

    <ThemeProvider theme={PatyShared.theme}>

      <CssBaseline />

      <NotificationProvider>

      <div className="isa-app">

        <header className="isa-header">

          <div className="isa-header-top">

            <span className="isa-logo">
              <img
                className="isa-logo-img"
                src="https://i.ibb.co/Kjg04Hb9/isa-patyia-avatar.png"
                alt=""
                width="36"
                height="36"
              />
              ISA PatyIA
            </span>

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

              ISA PatyIA · <code>{targetLabel}</code>

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



function bootApp() {

  if (!window.PatyIconify || !window.PatySqlExec || !window.PatyShared || !window.PatyNotify || !window.PatyNotifications || !window.PatySignalRLab || !window.PatyLabSession || !window.PatyLabAuth || !window.PatyJsonEditor || !window.PatyLogViewer || !window.PatyPromptsSqlTool) {

    setTimeout(bootApp, 40);

    return;

  }

  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(<App />);

}

bootApp();

