import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACRColors, ACRTypography } from '../theme/colors';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';

/**
 * The short privacy and cookies notice (Kraken, 17 September 2026).
 *
 * A layered notice: the essentials are on screen and the full section 15 of the
 * reviewer manual is one tap away, under READ DETAILS. The wording is the same
 * text as the manual, so the two can never drift apart in meaning.
 */
export const PrivacyNotice: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = {
    writingDirection: getLocaleDirection(language),
    textAlign: getTextAlign(language),
  };

  return (
    <View>
      <Text accessibilityRole="header" style={[styles.title, localText]}>{t('legal:title')}</Text>
      <Text style={[styles.body, localText]}>{t('legal:cookies')}</Text>
      <Line label={t('legal:controllerLabel')} value={t('legal:controller')} localText={localText} />
      <Line label={t('legal:processLabel')} value={t('legal:process')} localText={localText} />
      <Line label={t('legal:neverLabel')} value={t('legal:never')} localText={localText} />
      <Line label={t('legal:whyLabel')} value={t('legal:why')} localText={localText} />
      <Line label={t('legal:keptLabel')} value={t('legal:kept')} localText={localText} />
      <Line label={t('legal:rightsLabel')} value={t('legal:rights')} localText={localText} />
    </View>
  );
};

const Line: React.FC<{ label: string; value: string; localText: object }> = ({ label, value, localText }) => (
  <Text accessibilityRole="text" accessibilityLabel={`${label}: ${value}`} style={[styles.body, localText]}>
    <Text style={styles.label}>{`${label}: `}</Text>
    {value}
  </Text>
);

const styles = StyleSheet.create({
  title: {
    ...ACRTypography.cardTitle,
    color: ACRColors.primary,
    marginBottom: 8,
  },
  body: {
    ...ACRTypography.body,
    fontSize: 13,
    lineHeight: 19,
    color: ACRColors.ink,
    marginBottom: 7,
  },
  label: {
    fontWeight: '700',
    color: ACRColors.primaryDark,
  },
});
