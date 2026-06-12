/** Ambient types — ISA PatyIA (Babel runtime). */
interface IsaNs {
  UI: IsaUi;
  Theme: IsaTheme;
  Config: IsaConfig;
  Session: IsaSession;
  Auth: IsaAuth;
  APP_ID?: string;
  mount?: () => void;
}

interface Window {
  ISA: IsaNs;
  ISAFront: IsaFrontApi;
}

declare const React: ReactHooks;
declare const ReactDOM: ReactDOMApi;
declare const MaterialUI: Record<string, unknown>;
declare const Babel: BabelApi;

interface ReactHooks {
  useState<S>(initial: S | (() => S)): [S, (v: S | ((prev: S) => S)) => void];
  useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: unknown[]): T;
  useMemo<T>(factory: () => T, deps: unknown[]): T;
  useRef<T>(initial: T | null): { current: T | null };
  Fragment: unique symbol;
  createElement(type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]): unknown;
}

interface ReactDOMRoot {
  render(node: unknown): void;
}

interface ReactDOMApi {
  createRoot(container: Element | DocumentFragment): ReactDOMRoot;
}

interface BabelApi {
  transform(code: string, opts: { presets: string[]; filename?: string } | unknown): { code: string };
}

interface IsaAuth {
  isLoggedIn(): boolean;
  username(): string | null;
  authHeader(): Record<string, string>;
  login?(user: string, pass: string): Promise<unknown>;
  logout(): void;
  EVENT: string;
}

interface IsaSession {
  current(): { username: string; role: string | null; token: string; expiresAt: string | null; capabilities?: string[] } | null;
  isLoggedIn(): boolean;
  username(): string | null;
  authHeader(): Record<string, string>;
  appHeader(): Record<string, string>;
  appId(): string;
  login(user: string, pass: string): Promise<unknown>;
  logout(): void;
  refreshProfile(): Promise<unknown>;
  capabilities(): string[];
  can(cap: string): boolean;
  blockReason(cap: string): string;
  EVENT: string;
}

interface IsaUi {
  Icon: (props: { icon: string; size?: number }) => unknown;
  TargetSwitch: () => unknown;
  ThemeSwitch: (props: { mode: string; onToggle: () => void }) => unknown;
  Loading?: (props: { label?: string }) => unknown;
  ErrorBox?: (props: { message: string }) => unknown;
}

interface IsaTheme {
  useThemeMode(): { mode: string; theme: unknown; toggle: () => void };
}

interface IsaConfig {
  base(): string;
  apiUrl(path: string): string;
  isLocal(): boolean;
  setLocal(on: boolean): void;
  label?(): string;
  EVENT: string;
}

interface AppShellProps {
  ns: string;
  title: string;
  children?: unknown;
  icon?: string;
  toolbarExtra?: unknown;
  showTarget?: boolean;
  showTheme?: boolean;
  showAuthChip?: boolean;
  showLogout?: boolean;
  loginGate?: boolean;
}

interface IsaFrontApi {
  registerApp(opts: Record<string, unknown>): void;
  Layout: { AppShell: (props: AppShellProps) => unknown };
}
