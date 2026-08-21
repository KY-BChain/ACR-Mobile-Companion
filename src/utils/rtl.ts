export type LocaleDirection = 'ltr' | 'rtl';

const normalizeLanguage = (language?: string): string =>
  language?.trim().replace('_', '-').toLowerCase() ?? '';

export const isRTL = (language?: string): boolean => {
  const normalized = normalizeLanguage(language);
  return normalized === 'ar' || normalized === 'ar-sa';
};

export const getLocaleDirection = (language?: string): LocaleDirection =>
  isRTL(language) ? 'rtl' : 'ltr';

export const getFlexDirection = (language?: string) =>
  isRTL(language) ? 'row-reverse' as const : 'row' as const;

export const getTextAlign = (language?: string) =>
  isRTL(language) ? 'right' as const : 'left' as const;
