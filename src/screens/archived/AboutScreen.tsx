import React from 'react';
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

  const state = attestation?.verificationState || 'UNAVAILABLE';
  const lastVerified = attestation?.lastSuccessfulVerificationTimestamp || t('common:emDash');
  const ontologyHash = attestation?.expected?.ontologySha256 || t('about:unknownValue');

  return (
    <ScreenLayout
      title={t('about:title')}
      subtitle={t('about:subtitle')}
      bannerText={t('about:environment')}
      bannerVariant="trial"
      footer={
        <ACRButton title={t('common:close')} variant="primary" onPress={() => navigation.goBack()} />
      }
    >
      <ACRCard title={t('about:appSection')}>
        <Row label={t('about:marketingVersion')} value="0.1.0" />
        <Row label={t('about:nativeBuild')} value="42" />
        <Row label={t('about:easBuildProfile')} value="trial-internal" />
      </ACRCard>

      <ACRCard title={t('about:serviceSection')}>
        <Row label={t('about:gateway')} value="gw-v0.1.0" />
        <Row label={t('about:reasoner')} value="v2.2.1" />
        <Row label={t('about:responseContract')} value="m1" />
        <Row label={t('about:reasoningMode')} value="OPENLLET_SWRL" />
      </ACRCard>

      <ACRCard title={t('about:attestationSection')}>
        <Row
          label={t('about:state')}
          valueComponent={<ACRStateBadge state={state} />}
        />
        <Row label={t('about:lastVerified')} value={lastVerified} />
        <Text style={styles.hint}>{t('about:ontologyHashLabel')}</Text>
        <Text style={styles.prov}>{ontologyHash}</Text>
      </ACRCard>

      <ACRCard title={t('about:dataHandlingSection')}>
        <Text style={styles.hint}>
          {t('about:dataHandlingText')}
        </Text>
      </ACRCard>
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
    wordBreak: 'break-all',
  },
});