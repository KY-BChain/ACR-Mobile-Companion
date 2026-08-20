import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import { ACRStateBadge } from '../components/ACRStateBadge';
import { useAssessmentStore } from '../store/assessmentStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { attestation } = useAssessmentStore();
  const [page, setPage] = useState(0);

  useEffect(() => navigation.addListener('focus', () => setPage(0)), [navigation]);

  const state = attestation?.verificationState || 'UNAVAILABLE';
  const lastVerified = attestation?.lastSuccessfulVerificationTimestamp || t('common:emDash');
  const ontologyHash = attestation?.expected?.ontologySha256 || t('about:unknownValue');

  const pageTitles = [t('about:page1Title'), t('about:page3Title')];

  return (
    <ScreenLayout
      title={t('about:title')}
      subtitle={t('about:pageIndicator', { current: page + 1, total: 2 })}
      titleStyle={styles.aboutTitle}
      bannerText={t('about:environment')}
      bannerVariant="trial"
      footer={<>
        <ACRButton title={page === 0 ? t('common:cancel') : t('common:back')} variant="secondary" onPress={() => page === 0 ? navigation.navigate('Welcome') : setPage(page - 1)} />
        {page < 1 ? <ACRButton title={t('common:next')} variant="primary" onPress={() => setPage(page + 1)} /> : <ACRButton title={t('common:close')} variant="primary" onPress={() => navigation.navigate('Welcome')} />}
      </>}
    >
      {page === 0 ? <>
        <ACRCard title={t('about:page1Title')}><Text accessibilityRole="text" style={styles.bodyText}>{t('about:page1Text')}</Text></ACRCard>
        <ACRCard title={t('about:page2Title')}><Text accessibilityRole="text" style={styles.bodyText}>{t('about:page2Text')}</Text></ACRCard>
      </> : <>
        <ACRCard title={t('about:page3Title')}><Text accessibilityRole="text" style={styles.bodyText}>{t('about:page3Text')}</Text></ACRCard>
        <ACRCard title={t('about:page4Title')}><Text accessibilityRole="text" style={styles.bodyText}>{t('about:page4Text')}</Text></ACRCard>
        <ACRCard title={t('about:dataHandlingSection')}><Text style={styles.bodyText}>{t('about:dataHandlingText')}</Text></ACRCard>
      </>}
    </ScreenLayout>
  );
};

const Row: React.FC<{ label: string; value?: string; valueComponent?: React.ReactNode }> = ({
  label,
  value,
  valueComponent,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {valueComponent || <Text style={styles.rowValue}>{value}</Text>}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: ACRColors.line,
    borderStyle: 'dashed',
  },
  rowLabel: {
    fontSize: 11,
    color: ACRColors.ink,
  },
  rowValue: {
    fontSize: 11,
    fontWeight: '600',
    color: ACRColors.ink,
  },
  bodyText: {
    ...ACRTypography.body,
    fontSize: 17,
    lineHeight: 25,
    color: ACRColors.ink,
    marginVertical: 10,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  aboutTitle: {
    fontSize: 25,
  },
  hint: {
    ...ACRTypography.hint,
    color: ACRColors.muted,
    marginTop: 8,
    marginBottom: 4,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  prov: {
    ...ACRTypography.monospace,
    fontSize: 9.5,
    color: ACRColors.muted,
    lineHeight: 16,
  },
});