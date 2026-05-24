export const COLORS = {
  primary: '#2196F3',
  primaryDark: '#1565C0',
  primaryLight: '#E3F2FD',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  error: '#F44336',
  errorLight: '#FFEBEE',
  background: '#F0F4F8',
  surface: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  divider: '#F1F5F9',
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;
