import { ThemeConfig } from '../types/presentation';

export const THEMES: Record<string, ThemeConfig> = {
  'tech-modern-dark': {
    id: 'tech-modern-dark',
    name: 'Tech Modern Dark',
    backgroundColor: '#0a0f1d',
    surfaceColor: '#131b2e',
    primaryColor: '#38bdf8', // Cyan/sky blue
    secondaryColor: '#818cf8', // Indigo
    textColor: '#f8fafc',
    textMutedColor: '#94a3b8',
    accentColor: '#f43f5e', // Rose
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  'corporate-clean': {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    backgroundColor: '#ffffff',
    surfaceColor: '#f1f5f9',
    primaryColor: '#2563eb', // Royal blue
    secondaryColor: '#0d9488', // Teal
    textColor: '#0f172a',
    textMutedColor: '#64748b',
    accentColor: '#e11d48',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  'cyber-gradient': {
    id: 'cyber-gradient',
    name: 'Cyber Gradient',
    backgroundColor: '#050505',
    surfaceColor: '#121216',
    primaryColor: '#a855f7', // Purple
    secondaryColor: '#ec4899', // Pink
    textColor: '#ffffff',
    textMutedColor: '#a1a1aa',
    accentColor: '#06b6d4', // Cyan
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
};

export const DEFAULT_THEME = THEMES['tech-modern-dark'];

export function getTheme(themeId?: string): ThemeConfig {
  if (!themeId || !THEMES[themeId]) {
    return DEFAULT_THEME;
  }
  return THEMES[themeId];
}
