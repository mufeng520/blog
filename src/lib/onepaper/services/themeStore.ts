export type ThemeMode = 'dark' | 'light';

const THEME_KEY = 'onepaper-theme';

const isThemeMode = (value: string | null): value is ThemeMode => (
  value === 'dark' || value === 'light'
);

export const readStoredTheme = (): ThemeMode => {
  if (typeof localStorage === 'undefined') return 'light';

  const storedTheme = localStorage.getItem(THEME_KEY);
  return isThemeMode(storedTheme) ? storedTheme : 'light';
};

export const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};

export const storeTheme = (theme: ThemeMode) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme);
  }
  applyTheme(theme);
};

export const getNextTheme = (theme: ThemeMode): ThemeMode => (
  theme === 'dark' ? 'light' : 'dark'
);
