"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeName = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "cx-ui-theme";

export type ThemeProviderProps = {
  /** Controlled theme preference. */
  theme?: ThemeName;
  /** Initial theme when uncontrolled (default `"light"`). */
  defaultTheme?: ThemeName;
  className?: string;
  children: ReactNode;
};

export type ThemeContextValue = {
  theme: ThemeName;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeName | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
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

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({
  theme: themeProp,
  defaultTheme = "light",
  className,
  children,
}: ThemeProviderProps) {
  const isControlled = themeProp !== undefined;

  // Never read window during render: SSR and first client paint must match.
  const [internalTheme, setInternalTheme] = useState<ThemeName>(defaultTheme);
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const theme = isControlled ? themeProp : internalTheme;
  const resolved = resolveTheme(theme, systemDark);

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

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.dataset.cxTheme = resolved;
    root.style.colorScheme = resolved;
    root.classList.toggle("dark", resolved === "dark");
  }, [mounted, resolved]);

  const setTheme = useCallback(
    (next: ThemeName) => {
      if (isControlled) return;
      setInternalTheme(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    },
    [isControlled],
  );

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme: resolveTheme(theme, systemDark), setTheme }),
    [theme, systemDark, setTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={className ?? "min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"}
        {...(mounted ? { "data-cx-theme": resolved } : {})}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
