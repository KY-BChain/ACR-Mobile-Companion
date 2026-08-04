/**
 * ACR Mobile Companion — Design Tokens
 * Extracted from ACR-DD-013 v0.7 / ACR_Mobile_Mockup_iPhone_v0.7.html
 */

export const ACRColors = {
  // Primary
  primary: '#1a5276',
  primaryDark: '#123a54',
  teal: '#148f77',

  // Backgrounds
  background: '#f2f4f6',
  card: '#ffffff',
  ink: '#1c2833',
  muted: '#6b7a88',
  line: '#dde3e8',

  // Semantic
  warningBg: '#fdf2e3',
  warningBorder: '#e67e22',
  warningText: '#7d5a29',

  trialBg: '#efe8f7',
  trialBorder: '#8e44ad',
  trialText: '#4a2c66',

  stopBg: '#fdecea',
  stopBorder: '#c0392b',
  stopText: '#7b241c',

  // Badges
  native: '#8e44ad',
  verified: '#148f77',
  stop: '#c0392b',

  // States
  verifiedState: '#148f77',
  unavailableState: '#c0392b',

  // iOS
  iosBlue: '#007AFF',
} as const;

export const ACRTypography = {
  logo: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 1 },
  headerTitle: { fontSize: 15, fontWeight: '600' as const },
  headerSub: { fontSize: 10, opacity: 0.85 },
  cardTitle: { fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.4 },
  label: { fontSize: 11.5, fontWeight: '600' as const },
  body: { fontSize: 13, fontWeight: '400' as const },
  hint: { fontSize: 9.5, fontWeight: '400' as const, lineHeight: 14 },
  button: { fontSize: 13.5, fontWeight: '600' as const },
  badge: { fontSize: 8.5, fontWeight: '700' as const, letterSpacing: 0.3 },
  stateBadge: { fontSize: 9, fontWeight: '700' as const },
  monospace: { fontFamily: 'ui-monospace, Menlo, monospace' as const },
  confValue: { fontSize: 15, fontWeight: '700' as const, fontFamily: 'ui-monospace, Menlo, monospace' as const },
  subtypeValue: { fontSize: 19, fontWeight: '700' as const },
  subtypeLabel: { fontSize: 9.5, fontWeight: '400' as const, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
  stopTitle: { fontSize: 14, fontWeight: '700' as const },
  stopBody: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
} as const;

export const ACRCardStyle = {
  backgroundColor: ACRColors.card,
  borderWidth: 1,
  borderColor: ACRColors.line,
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
};

export const ACRButtonStyle = {
  primary: {
    backgroundColor: ACRColors.primary,
    color: '#fff',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
  },
  secondary: {
    backgroundColor: '#fff',
    color: ACRColors.primary,
    borderRadius: 10,
    borderWidth: 1.4,
    borderColor: ACRColors.primary,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: ACRColors.muted,
    borderRadius: 10,
    borderWidth: 1.4,
    borderColor: ACRColors.line,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
  },
};
