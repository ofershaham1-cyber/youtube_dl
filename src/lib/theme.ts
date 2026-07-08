export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme";

export function getStoredTheme(storage: Storage | undefined = window.localStorage): ThemeMode | null {
  const value = storage?.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function resolveTheme(storage: Storage | undefined = window.localStorage, systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches): ThemeMode {
  return getStoredTheme(storage) ?? (systemPrefersDark ? "dark" : "light");
}

export function applyTheme(theme: ThemeMode, root: HTMLElement | null = document.documentElement) {
  if (!root) return;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export function setTheme(theme: ThemeMode, storage: Storage | undefined = window.localStorage, root: HTMLElement | null = document.documentElement) {
  storage?.setItem(STORAGE_KEY, theme);
  applyTheme(theme, root);
  return theme;
}
