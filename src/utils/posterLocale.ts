export type PosterLocale = 'en' | 'fr' | 'zh-CN';

export const getPosterLocale = (language?: string): PosterLocale => {
  if (language === 'fr-FR') {
    return 'fr';
  }

  if (language === 'zh-CN') {
    return 'zh-CN';
  }

  return 'en';
};
