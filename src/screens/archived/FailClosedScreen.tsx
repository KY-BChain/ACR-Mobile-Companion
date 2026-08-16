import React, { useState } from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import { ACRStopBox } from '../components/ACRStopBox';
import { ACRStateBadge } from '../components/ACRStateBadge';
import { useAssessmentStore } from '../store/assessmentStore';
import { checkAttestation } from '../api/attestation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const FailClosedScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { attestation, setAttestation } = useAssessmentStore();
  const [checking, setChecking] = useState(false);

  const handleRetry = async () => {
    setChecking(true);
    try {
      const att = await checkAttestation();
      setAttestation(att);
      if (att.verificationState === 'VERIFIED') {
        navigation.navigate('Review');
      }
    } catch (e) {
      // remain on fail-closed
    } finally {
      setChecking(false);
    }
  };

  const state = attestation?.verificationState || 'UNAVAILABLE';
  const lastSuccess = attestation?.lastSuccessfulVerificationTimestamp || t('common:emDash');

  return (
    <ScreenLayout
      title={t('failClosed:title')}
      subtitle={t('failClosed:subtitle')}
      bannerText={t('assessment:clinicalTransparencyBanner')}
      footer={
        <>
          <ACRButton title={t('common:about')} variant="secondary" onPress={() => navigation.navigate('About')} />
          <ACRButton title={t('failClosed:retryCheck')} variant="primary" onPress={handleRetry} disabled={checking} />
        </>
      }
    >
      <ACRStopBox
        title={t('failClosed:blockedTitle')}
        message={t('failClosed:blockedMessage')}
      />

      <ACRCard title={t('failClosed:verificationDetail')} style={{ marginTop: 12 }}>
        <Row label={t('failClosed:state')} valueComponent={<ACRStateBadge state={state} />} />
        <Row label={t('failClosed:expectedReasoner')} value="v2.2.1" />
        <Row label={t('failClosed:observedReasoner')} value={attestation?.observed?.reasonerVersion || t('common:emDash')} />
        <Row label={t('failClosed:ontologyHash')} value={attestation?.observed?.ontologySha256 ? t('failClosed:observed') : t('failClosed:notObserved')} />
        <Row label={t('failClosed:lastSuccessfulCheck')} value={lastSuccess} />
        <Text style={styles.hint}>
          {t('failClosed:verificationHint')}
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
    marginTop: 4,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
