import enGB from './en-GB.json';
import zhCN from './zh-CN.json';
import frFR from './fr-FR.json';
import deDE from './de-DE.json';
import ruRU from './ru-RU.json';
import arSA from './ar-SA.json';
import koKR from './ko-KR.json';
import jaJP from './ja-JP.json';

/**
 * Reviewer manual content, generated from docs/clinical by
 * scripts/build-manual-content.js. Every language the app offers has its own
 * manual (Kraken, 18 September 2026); English remains the fallback for a
 * language that has none.
 */
export type ManualBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'row'; label: string; value: string };

export interface ManualPage {
  title: string;
  blocks: ManualBlock[];
}

const MANUALS: Record<string, { pages: ManualPage[] }> = {
  'en-GB': enGB as { pages: ManualPage[] },
  'zh-CN': zhCN as { pages: ManualPage[] },
  'fr-FR': frFR as { pages: ManualPage[] },
  'de-DE': deDE as { pages: ManualPage[] },
  'ru-RU': ruRU as { pages: ManualPage[] },
  'ar-SA': arSA as { pages: ManualPage[] },
  'ko-KR': koKR as { pages: ManualPage[] },
  'ja-JP': jaJP as { pages: ManualPage[] },
};

export function manualPages(language: string): { pages: ManualPage[]; isEnglishFallback: boolean } {
  const manual = MANUALS[language];
  if (manual) return { pages: manual.pages, isEnglishFallback: false };
  return { pages: MANUALS['en-GB'].pages, isEnglishFallback: true };
}

/**
 * The legal notice, so the poster's READ DETAILS and About can open it directly.
 * Every manual numbers it 15; the wording is matched only as a backstop.
 */
export function legalPageIndex(pages: ManualPage[]): number {
  const numbered = pages.findIndex(page => /^15\./.test(page.title.trim()));
  if (numbered >= 0) return numbered;
  const named = pages.findIndex(page => /(GDPR|RGPD|DSGVO|Cookies)/i.test(page.title));
  return named < 0 ? 0 : named;
}
