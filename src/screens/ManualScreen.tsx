import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';
import { manualPages, legalPageIndex } from '../content/manual';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * The reviewer manual, one numbered page per section, in the same shape as the
 * About screens. Its content is generated from the Markdown manuals in
 * docs/clinical by scripts/build-manual-content.js, so the printed manual and
 * the in-app manual are always the same document.
 */
export const ManualScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Manual'>>();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const { pages, isEnglishFallback } = manualPages(language);
  const [page, setPage] = useState(route.params?.section === 'legal' ? legalPageIndex(pages) : 0);

  useEffect(() => navigation.addListener('blur', () => setPage(0)), [navigation]);

  const localText = {
    writingDirection: getLocaleDirection(language),
    textAlign: getTextAlign(language),
  };
  const current = pages[Math.min(page, pages.length - 1)];
  const last = page >= pages.length - 1;

  return (
    <ScreenLayout
      title={t('manual:title')}
      subtitle={t('manual:pageIndicator', { current: page + 1, total: pages.length })}
      bannerText={t('app:trialBanner')}
      bannerVariant="trial"
      footer={<>
        <ACRButton
          title={page === 0 ? t('common:close') : t('common:back')}
          variant="secondary"
          onPress={() => (page === 0 ? navigation.goBack() : setPage(page - 1))}
        />
        <ACRButton
          title={last ? t('common:close') : t('common:next')}
          variant="primary"
          onPress={() => (last ? navigation.goBack() : setPage(page + 1))}
        />
      </>}
    >
      {isEnglishFallback ? <Text style={[styles.fallback, localText]}>{t('manual:englishFallback')}</Text> : null}
      <ACRCard title={current.title}>
        {current.blocks.map((block, index) => {
          if (block.type === 'heading') {
            return <Text key={index} accessibilityRole="header" style={[styles.heading, localText]}>{block.text}</Text>;
          }
          if (block.type === 'bullet') {
            return <Text key={index} style={[styles.body, styles.bullet, localText]}>{`• ${block.text}`}</Text>;
          }
          if (block.type === 'row') {
            return (
              <Text
                key={index}
                accessibilityLabel={`${block.label}: ${block.value}`}
                style={[styles.body, localText]}
              >
                <Text style={styles.rowLabel}>{block.label ? `${block.label}: ` : ''}</Text>
                {block.value}
              </Text>
            );
          }
          return <Text key={index} style={[styles.body, localText]}>{block.text}</Text>;
        })}
      </ACRCard>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: {
    ...ACRTypography.body,
    fontSize: 13,
    lineHeight: 19,
    color: ACRColors.ink,
    marginBottom: 7,
  },
  bullet: {
    paddingLeft: 6,
  },
  rowLabel: {
    fontWeight: '700',
    color: ACRColors.primaryDark,
  },
  heading: {
    ...ACRTypography.cardTitle,
    fontSize: 14,
    color: ACRColors.primaryDark,
    marginTop: 6,
    marginBottom: 6,
  },
  fallback: {
    ...ACRTypography.hint,
    color: ACRColors.muted,
    marginBottom: 6,
  },
});
