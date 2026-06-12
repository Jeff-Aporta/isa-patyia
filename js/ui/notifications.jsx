/**
 * Puente isa-patyia → feedback compartido (front-shared / ISAFront.Feedback).
 * AppShell ya monta UI.FeedbackProvider dentro de ThemeProvider; no envolver de nuevo aquí.
 */
import { getReact } from "../core/runtime.ts";

const fb = () => globalThis.ISAFront?.Feedback;

export function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}

export function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}

export function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}

export function toastWarning(text, timeout) {
  fb()?.toast?.warning?.(text, timeout);
}

export function notifyFromSignalR(payload) {
  fb()?.toast?.fromPayload?.(payload);
}

export function requestConfirm(opts) {
  return fb()?.confirm?.(opts) ?? Promise.resolve(false);
}

export const confirm = requestConfirm;

export function useNotify() {
  return {
    toastError,
    toastSuccess,
    toastInfo,
    toastWarning,
    confirm: requestConfirm,
  };
}

export function NotificationProvider({ children }) {
  const { useEffect, useState } = getReact();
  const [ready, setReady] = useState(!!globalThis.ISAFront?.FeedbackProvider);

  useEffect(() => {
    if (globalThis.ISAFront?.FeedbackProvider) {
      setReady(true);
      return;
    }
    const t = setInterval(() => {
      if (globalThis.ISAFront?.FeedbackProvider) {
        setReady(true);
        clearInterval(t);
      }
    }, 50);
    return () => clearInterval(t);
  }, []);

  const Provider = globalThis.ISAFront?.FeedbackProvider;
  if (!Provider) return children;
  return <Provider>{children}</Provider>;
}
