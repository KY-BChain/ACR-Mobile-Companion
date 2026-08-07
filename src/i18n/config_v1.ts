import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import all translation resources
import enGB from './locales/en-GB.json';
import frFR from './locales/fr-FR.json';
import deDE from './locales/de-DE.json';
import ruRU from './locales/ru-RU.json';
import arSA from './locales/ar-SA.json';
import zhCN from './locales/zh-CN.json';
import koKR from './locales/ko-KR.json';
import jaJP from './locales/ja-JP.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', rtl: false },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳', rtl: false },
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷', rtl: false },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵', rtl: false },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

const resources = {
  'en-GB': { translation: enGB },
  'fr-FR': { translation: frFR },
  'de-DE': { translation: deDE },
  'ru-RU': { translation: ruRU },
  'ar-SA': { translation: arSA },
  'zh-CN': { translation: zhCN },
  'ko-KR': { translation: koKR },
  'ja-JP': { translation: jaJP },
};

// Detect device locale or fallback to en-GB
const deviceLocale = Localization.locale;
const matchedLang = SUPPORTED_LANGUAGES.find(l => 
  deviceLocale.startsWith(l.code.split('-')[0])
);
const defaultLang: LanguageCode = matchedLang?.code ?? 'en-GB';

// RTL handling for Arabic
if (defaultLang === 'ar-SA' && !I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en-GB',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
    // ACR-DD-014: No clinical data in logs — ensure i18n doesn't leak
    debug: false,
  });

export const changeLanguage = async (lang: LanguageCode) => {
  const isRTL = lang === 'ar-SA';
  const currentlyRTL = I18nManager.isRTL;

  await i18n.changeLanguage(lang);

  if (isRTL !== currentlyRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Note: App restart required for full RTL layout switch
    // Use expo-updates or react-native-restart in production
  }
};

export default i18n;
