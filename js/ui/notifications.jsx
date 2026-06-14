/** Puente isa-patyia → ISAFront.Feedback. */
const fb = () => globalThis.ISAFront?.Feedback;

export function toastError(text, timeout) { fb()?.toast?.error?.(text, timeout); }
export function toastSuccess(text, timeout) { fb()?.toast?.success?.(text, timeout); }
export function toastInfo(text, timeout) { fb()?.toast?.info?.(text, timeout); }
export function toastWarning(text, timeout) { fb()?.toast?.warning?.(text, timeout); }
export function requestConfirm(opts) { return fb()?.confirm?.(opts) ?? Promise.resolve(false); }
