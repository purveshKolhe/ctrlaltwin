import { ThemeConfig } from '../types/presentation';

export const THEMES: Record<string, ThemeConfig> = {
  'healthcare-modern-blue': {
    id: 'healthcare-modern-blue',
    name: 'Healthcare Modern Blue (Clean Light - Borcelle PDF)',
    backgroundColor: '#f8fafc', // Crisp clean light medical slate (from PDF)
    surfaceColor: '#ffffff', // Pure white clinical card surface
    primaryColor: '#0284c7', // Trustworthy medical cyan / ocean blue
    secondaryColor: '#0d9488', // Healing teal
    textColor: '#0f172a', // Deep slate black for maximum readability
    textMutedColor: '#475569', // Professional clinical subtitle slate
    accentColor: '#2563eb', // Royal blue accent
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
  },
  'tech-modern-dark': {
    id: 'tech-modern-dark',
    name: 'Tech Modern Dark',
    backgroundColor: '#070913',
    surfaceColor: '#0f172a',
    primaryColor: '#38bdf8', // Cyan
    secondaryColor: '#818cf8', // Indigo
    textColor: '#f8fafc',
    textMutedColor: '#94a3b8',
    accentColor: '#f43f5e',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
  },
  'corporate-clean': {
    id: 'corporate-clean',
    name: 'Corporate Clean (Light)',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    primaryColor: '#2563eb', // Royal blue
    secondaryColor: '#0d9488', // Teal
    textColor: '#0f172a',
    textMutedColor: '#64748b',
    accentColor: '#e11d48',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
  },
  'cyber-gradient': {
    id: 'cyber-gradient',
    name: 'Cyber Gradient (Dark)',
    backgroundColor: '#050505',
    surfaceColor: '#121216',
    primaryColor: '#a855f7', // Purple
    secondaryColor: '#ec4899', // Pink
    textColor: '#ffffff',
    textMutedColor: '#a1a1aa',
    accentColor: '#06b6d4', // Cyan
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
  },
};

export const DEFAULT_THEME = THEMES['healthcare-modern-blue'];

export function getTheme(themeId?: string): ThemeConfig {
  if (!themeId || !THEMES[themeId]) {
    return DEFAULT_THEME;
  }
  return THEMES[themeId];
}
