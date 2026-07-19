export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'calendula-theme';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const THEME_TRANSITION = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
