import enGB from './en-GB.json';
import zhCN from './zh-CN.json';

/**
 * Reviewer manual content, generated from docs/clinical by
 * scripts/build-manual-content.js. Only the two checked languages have their own
 * manual; every other language falls back to English and says so on screen.
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
};

export function manualPages(language: string): { pages: ManualPage[]; isEnglishFallback: boolean } {
  const manual = MANUALS[language];
  if (manual) return { pages: manual.pages, isEnglishFallback: false };
  return { pages: MANUALS['en-GB'].pages, isEnglishFallback: true };
}

/** The legal notice section, so About can open it directly. */
export function legalPageIndex(pages: ManualPage[]): number {
  const index = pages.findIndex(page => /(GDPR|Cookies)/i.test(page.title));
  return index < 0 ? 0 : index;
}
