"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import "../styles/tokens.css";
import "../styles/primitives.css";

export type ThemeName = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "cx-ui-theme";

export type ThemeTokenOverrides = {
  color?: Partial<Record<string, string>>;
};

export type ThemeProviderProps = {
  /** Controlled theme preference */
  theme?: ThemeName;
  /** Initial theme when uncontrolled (default `"light"`) */
  defaultTheme?: ThemeName;
  tokens?: ThemeTokenOverrides;
  className?: string;
  children: ReactNode;
};

export type ThemeContextValue = {
  theme: ThemeName;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PRIMITIVE_PREFIXES = [
  "brand-",
  "neutral-",
  "red-",
  "green-",
  "yellow-",
  "blue-",
  "orange-",
  "indigo-",
  "pink-",
  "purple-",
  "white",
  "black",
  "alpha-",
];

function resolveTokenKey(key: string): string {
  const normalized = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  const isPrimitive = PRIMITIVE_PREFIXES.some(
    (prefix) =>
      normalized === prefix.replace(/-$/, "") ||
      normalized.startsWith(prefix) ||
      /^(brand|neutral|red|green|yellow|blue|orange|indigo|pink|purple)-\d+$/.test(
        normalized,
      ),
  );
  if (isPrimitive || /^(brand|neutral|red|green|yellow|blue)-\d+$/.test(normalized)) {
    return `--cx-${normalized}`;
  }
  return `--cx-color-${normalized}`;
}

function readStoredTheme(): ThemeName | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* localStorage unavailable */
  }
  return null;
}

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: ThemeName, systemDark: boolean): "light" | "dark" {
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

function applyResolvedToDocument(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.cxTheme = resolved;
  root.style.colorScheme = resolved;
  root.classList.toggle("cx-dark", resolved === "dark");
  // Drop interim FOUC colors from the blocking layout script; CSS tokens own paint.
  root.style.backgroundColor = "";
  root.style.color = "";
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({
  theme: themeProp,
  defaultTheme = "light",
  tokens,
  className,
  children,
}: ThemeProviderProps) {
  const isControlled = themeProp !== undefined;

  // Keep SSR + first client paint identical — never read window in useState.
  const [internalTheme, setInternalTheme] = useState<ThemeName>(defaultTheme);
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const theme = isControlled ? themeProp! : internalTheme;

  // After mount: hydrate preference from localStorage and system scheme.
  useEffect(() => {
    setSystemDark(getSystemDark());
    if (!isControlled) {
      const stored = readStoredTheme();
      if (stored) setInternalTheme(stored);
    }
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [isControlled]);

  // Until mounted, do NOT force light on this wrapper. A blocking layout script
  // already sets `data-cx-theme` / `.cx-dark` on <html>; omitting the attribute
  // here lets those tokens inherit and avoids a light→dark flash.
  const resolved = resolveTheme(theme, systemDark);

  const setTheme = useCallback(
    (next: ThemeName) => {
      if (!isControlled) {
        setInternalTheme(next);
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
      }
    },
    [isControlled],
  );

  useEffect(() => {
    if (!mounted) return;
    applyResolvedToDocument(resolved);
  }, [mounted, resolved]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      // Must match SSR on the first client render — never read `document` here.
      // The blocking layout script still paints <html> correctly; consumers
      // that branch on resolvedTheme (e.g. theme toggle icons) stay hydrated.
      resolvedTheme: resolveTheme(theme, systemDark),
      setTheme,
    }),
    [theme, systemDark, setTheme],
  );

  const style: CSSProperties & Record<string, string> = {
    // Inherit color-scheme from <html> until hydrated; then own it.
    ...(mounted ? { colorScheme: resolved } : {}),
    backgroundColor: "var(--cx-color-bg-secondary)",
    minHeight: "100vh",
  };

  if (tokens?.color) {
    for (const [key, value] of Object.entries(tokens.color)) {
      if (value) style[resolveTokenKey(key)] = value;
    }
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={cx(
          "cx-ui",
          // Only stamp dark/light on the wrapper after mount so SSR markup
          // matches the first client render (no data-cx-theme yet) while the
          // blocking script keeps <html> correct for first paint.
          mounted && resolved === "dark" && "cx-dark",
          className,
        )}
        {...(mounted ? { "data-cx-theme": resolved } : {})}
        style={style}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
