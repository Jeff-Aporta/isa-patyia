const { useState, useEffect, useCallback, createContext, useContext } = React;
const {
  Snackbar, Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
} = MaterialUI;
const { ButtonIconify } = PatyIconify;

const DEFAULT_TIMEOUT = 4500;
const listeners = new Set();
let confirmResolver = null;

function emitToast(toast) {
  const item = { ...toast, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  listeners.forEach((fn) => fn(item));
  return item.id;
}

function pushToast(type, text, timeout = DEFAULT_TIMEOUT) {
  return emitToast({ type, text, timeout });
}

function toastError(text, timeout) {
  pushToast("error", text, timeout);
  if (typeof console !== "undefined") console.error("[ISA PatyIA]", text);
}

function toastSuccess(text, timeout) {
  pushToast("success", text, timeout);
}

function toastInfo(text, timeout) {
  pushToast("info", text, timeout);
}

function toastWarning(text, timeout) {
  pushToast("warning", text, timeout);
}

function requestConfirm({ title = "Confirmar", message = "", confirmLabel = "Continuar", cancelLabel = "Cancelar" } = {}) {
  return new Promise((resolve) => {
    confirmResolver = resolve;
    window.dispatchEvent(new CustomEvent("isa-patyia:confirm", {
      detail: { title, message, confirmLabel, cancelLabel },
    }));
  });
}

const NotifyContext = createContext(null);

function useNotify() {
  const ctx = useContext(NotifyContext);
  return ctx || {
    toastError,
    toastSuccess,
    toastInfo,
    toastWarning,
    confirm: requestConfirm,
  };
}

function ToastStack({ items, onClose }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {items.map((t, i) => (
        <Snackbar
          key={t.id}
          open
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ position: "relative", mb: 0, mt: 0, bottom: "auto", right: "auto" }}
          style={{ transform: `translateY(-${i * 4}px)` }}
        >
          <Alert
            severity={t.type}
            variant="filled"
            onClose={() => onClose(t.id)}
            sx={{ width: "100%", maxWidth: 420, boxShadow: 3 }}
          >
            {t.title && <AlertTitle sx={{ py: 0 }}>{t.title}</AlertTitle>}
            {t.text}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
}

function ConfirmDialog({ state, onAnswer }) {
  if (!state?.open) return null;
  return (
    <Dialog open onClose={() => onAnswer(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{state.title}</DialogTitle>
      <DialogContent dividers>
        <p className="confirm-message">{state.message}</p>
      </DialogContent>
      <DialogActions sx={{ gap: 1, px: 2, pb: 2 }}>
        <ButtonIconify
          icon="mdi:close"
          label={state.cancelLabel}
          title={state.cancelLabel}
          onClick={() => onAnswer(false)}
        />
        <ButtonIconify
          variant="primary"
          icon="mdi:check"
          label={state.confirmLabel}
          title={state.confirmLabel}
          onClick={() => onAnswer(true)}
        />
      </DialogActions>
    </Dialog>
  );
}

function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev.slice(-5), toast]);
    const ms = toast.timeout ?? DEFAULT_TIMEOUT;
    if (ms > 0) {
      setTimeout(() => removeToast(toast.id), ms);
    }
  }, [removeToast]);

  useEffect(() => {
    listeners.add(addToast);
    return () => listeners.delete(addToast);
  }, [addToast]);

  useEffect(() => {
    function onConfirm(e) {
      setConfirmState({ open: true, ...e.detail });
    }
    window.addEventListener("isa-patyia:confirm", onConfirm);
    return () => window.removeEventListener("isa-patyia:confirm", onConfirm);
  }, []);

  function answerConfirm(ok) {
    setConfirmState(null);
    if (confirmResolver) {
      confirmResolver(ok);
      confirmResolver = null;
    }
  }

  const api = {
    toastError,
    toastSuccess,
    toastInfo,
    toastWarning,
    confirm: requestConfirm,
  };

  return (
    <NotifyContext.Provider value={api}>
      {children}
      <ToastStack items={toasts} onClose={removeToast} />
      <ConfirmDialog state={confirmState} onAnswer={answerConfirm} />
    </NotifyContext.Provider>
  );
}

/** Mapea payload lab:notify → toast */
function notifyFromSignalR(payload) {
  if (!payload || typeof payload !== "object") {
    toastInfo(typeof payload === "string" ? payload : JSON.stringify(payload ?? {}));
    return;
  }
  const type = String(payload.type ?? payload.kind ?? "info").toLowerCase();
  const text = payload.message ?? payload.text ?? payload.title ?? JSON.stringify(payload);
  const title = payload.title && payload.message ? payload.title : undefined;
  if (/error|fail|denied/.test(type)) {
    emitToast({ type: "error", text, title, timeout: 6000 });
  } else if (/warn|warning/.test(type)) {
    emitToast({ type: "warning", text, title });
  } else if (/success|done|complete|ok/.test(type)) {
    emitToast({ type: "success", text, title });
  } else {
    emitToast({ type: "info", text, title });
  }
}

window.PatyNotify = {
  toastError,
  toastSuccess,
  toastInfo,
  toastWarning,
  confirm: requestConfirm,
  notifyFromSignalR,
};

window.PatyNotifications = { NotificationProvider, useNotify };
