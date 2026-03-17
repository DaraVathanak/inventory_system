const THEME_KEY = "inventory_theme";

export function getInitialTheme(): boolean {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored !== null) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(isDark: boolean): void {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}