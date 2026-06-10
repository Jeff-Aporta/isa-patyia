const { useState, useEffect, useRef, useCallback } = React;
const { Tooltip } = MaterialUI;

const DEFAULT_EVENT = "lab:notify";

function negotiateUrl() {
  const base = PatyAppConfig.getLabBase().replace(/\/$/, "");
  return `${base}/api/signalr/negotiate`;
}

async function fetchNegotiateInfo(userId) {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const url = `${negotiateUrl()}${q}`;
  const auth = await PatyLabSession.serviceAuthHeaders("signalr");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...auth,
    },
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    throw new Error(text || `negotiate HTTP ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(data.error ?? data.hint ?? `negotiate HTTP ${res.status}`);
  }
  const info = data.url && data.accessToken ? data : data.connectionInfo;
  if (!info?.url || !info?.accessToken) {
    throw new Error(data.error ?? data.hint ?? "Negotiate sin url/accessToken (¿SignalR provisionado en el servidor?)");
  }
  return info;
}

async function connectLabSignalR({ userId, onStatus, onNotify }) {
  const signalR = window.signalR;
  if (!signalR?.HubConnectionBuilder) {
    throw new Error("SDK @microsoft/signalr no cargado");
  }

  onStatus?.("connecting");
  const info = await fetchNegotiateInfo(userId);

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(info.url, {
      accessTokenFactory: () => info.accessToken,
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on(DEFAULT_EVENT, (payload) => {
    onNotify?.(payload);
    window.dispatchEvent(new CustomEvent("isa-patyia:signalr-notify", { detail: payload }));
  });

  connection.onreconnecting(() => onStatus?.("reconnecting"));
  connection.onreconnected(() => onStatus?.("connected"));
  connection.onclose(() => onStatus?.("disconnected"));

  await connection.start();
  onStatus?.("connected");

  return {
    connection,
    async disconnect() {
      try {
        await connection.stop();
      } catch (_) { /* ignore */ }
      onStatus?.("disconnected");
    },
  };
}

function statusTitle(state, lastErr, target) {
  let title;
  switch (state) {
    case "connected":
      title = "SignalR conectado";
      break;
    case "connecting":
      title = "SignalR conectando…";
      break;
    case "reconnecting":
      title = "SignalR reconectando…";
      break;
    case "error":
      title = "SignalR error";
      break;
    default:
      title = "SignalR desconectado";
  }
  const parts = [title, target];
  if (lastErr) parts.push(lastErr);
  return parts.filter(Boolean).join(" · ");
}

function signalDotTone(state) {
  if (state === "connected") return "green";
  if (state === "connecting" || state === "reconnecting" || state === "error") return "orange";
  return "gray";
}

function useSignalRLab() {
  const [state, setState] = useState("disconnected");
  const [lastErr, setLastErr] = useState("");
  const [target, setTarget] = useState(PatyAppConfig.getLabTargetLabel());
  const clientRef = useRef(null);
  const genRef = useRef(0);

  const disconnect = useCallback(async () => {
    const c = clientRef.current;
    clientRef.current = null;
    if (c) await c.disconnect();
  }, []);

  const connect = useCallback(async () => {
    if (!PatyLabSession.can("signalr")) {
      const reason = PatyLabSession.blockReason("signalr");
      setState("disconnected");
      setLastErr(reason);
      return;
    }

    try {
      const health = await PatyLabApi.pingLab();
      if (health?.signalR?.configured === false) {
        setState("error");
        setLastErr("Azure SignalR no configurado en el servidor");
        PatyNotify.toastWarning("SignalR: AzureSignalRConnectionString no está en la Function App");
        return;
      }
    } catch (_) { /* health opcional */ }

    const gen = ++genRef.current;
    await disconnect();
    setLastErr("");

    try {
      const userId = PatyLabSession.getSession()?.username || "isa-patyia";
      const client = await connectLabSignalR({
        userId,
        onStatus: (s) => { if (genRef.current === gen) setState(s); },
        onNotify: (payload) => PatyNotify.notifyFromSignalR(payload),
      });
      if (genRef.current !== gen) {
        await client.disconnect();
        return;
      }
      clientRef.current = client;
    } catch (err) {
      if (genRef.current !== gen) return;
      const msg = err instanceof Error ? err.message : String(err);
      setLastErr(msg);
      setState("error");
      if (err?.code !== "FORBIDDEN" && err?.code !== "NO_SESSION") {
        PatyNotify.toastWarning(`SignalR: ${msg}`);
      } else {
        PatyLabSession.handleApiError(err, "signalr");
      }
    }
  }, [disconnect]);

  useEffect(() => {
    connect();
    return () => { disconnect(); };
  }, [connect, target]);

  useEffect(() => {
    const onAuth = () => connect();
    const onTarget = () => setTarget(PatyAppConfig.getLabTargetLabel());
    window.addEventListener("isa-patyia:auth", onAuth);
    window.addEventListener("isa-patyia:lab-target", onTarget);
    return () => {
      window.removeEventListener("isa-patyia:auth", onAuth);
      window.removeEventListener("isa-patyia:lab-target", onTarget);
    };
  }, [connect]);

  const tip = statusTitle(state, lastErr, target);
  const tone = signalDotTone(state);

  return { state, lastErr, target, tip, tone, connect };
}

function SignalRStatusDot({ tone, tip, onReconnect }) {
  function onDotClick(e) {
    e.stopPropagation();
    onReconnect?.();
  }

  return (
    <Tooltip title={tip} arrow>
      <span
        role="button"
        tabIndex={0}
        className={`status-dot status-dot--inline status-dot--${tone}`}
        onClick={onDotClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onReconnect?.();
          }
        }}
        aria-label={tip}
      />
    </Tooltip>
  );
}

window.PatySignalRLab = {
  useSignalRLab,
  SignalRStatusDot,
  connectLabSignalR,
  DEFAULT_EVENT,
};

