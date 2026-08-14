export const colors = {
  background: '#090B0A',
  surface: '#141715',
  surfaceElevated: '#1B1F1C',
  border: '#282D29',
  text: '#F5F7F5',
  textMuted: '#929A94',
  textSubtle: '#626A64',
  primary: '#B7F34A',
  primaryPressed: '#9ED337',
  primarySoft: '#26351A',
  success: '#69D38A',
  warning: '#F5B84B',
  danger: '#F07878',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
} as const;
