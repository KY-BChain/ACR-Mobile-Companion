import { I18nManager } from 'react-native';
import { LanguageCode } from '../i18n/config';

export const isRTL = (lang: LanguageCode): boolean => lang === 'ar-SA';

export const getFlexDirection = (lang: LanguageCode) => 
  isRTL(lang) ? 'row-reverse' as const : 'row' as const;

export const getTextAlign = (lang: LanguageCode) =>
  isRTL(lang) ? 'right' as const : 'left' as const;

export const forceRTL = (rtl: boolean) => {
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    // Requires app restart to take full effect
  }
};