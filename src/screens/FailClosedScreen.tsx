import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import { ACRStopBox } from '../components/ACRStopBox';
import { ACRStateBadge } from '../components/ACRStateBadge';
import { ACRColors, ACRTypography } from '../theme/colors';
import { useAssessmentStore } from '../store/assessmentStore';
import { gatewayClient, toFailureState } from '../api/client';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const FailClosedScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { attestation, failure, setAttestation, setFailure, setResult } = useAssessmentStore();
  const [checking, setChecking] = useState(false);
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  const code = failure?.code ?? 'SERVICE_UNAVAILABLE';
  const isAttestation = code === 'ATTESTATION_MISMATCH' || code === 'ATTESTATION_UNAVAILABLE';
  const visibleMessage = code === 'SERVICE_UNAVAILABLE' || code === 'ATTESTATION_UNAVAILABLE' || code === 'UPSTREAM_NOT_CONFIGURED'
      || code === 'UPSTREAM_TIMEOUT' || code === 'UPSTREAM_HTTP_ERROR' || code === 'INVALID_UPSTREAM_RESPONSE'
      || code === 'BAYESIAN_ENHANCEMENT_UNAVAILABLE' || code === 'INFERENCE_FAILED'
    ? t('build44:serverNotConnected')
    : code === 'ATTESTATION_MISMATCH' ? t('build44:baselineMismatch')
      : code === 'DEMO_FIXTURE_NOT_AVAILABLE' ? t('build44:fixtureUnavailable')
        : code === 'INFERENCE_OUTCOME_INDETERMINATE' || failure?.outcome === 'INDETERMINATE' ? t('build44:indeterminate')
          : code === 'AUTHENTICATION_REQUIRED' || code === 'INVITE_INVALID' || code === 'TOKEN_REUSE_DETECTED' ? t('build44:authExpired')
            : failure?.message ?? t('failClosed:blockedMessage');

  const handleAction = async () => {
    setResult(null);
    if (!isAttestation) { navigation.navigate('GatewayAccess'); return; }
    setChecking(true);
    try {
      const next = await gatewayClient.checkAttestation();
      setAttestation(next);
      if (next.verificationState === 'VERIFIED') { setFailure(null); navigation.navigate('Review'); }
      else setFailure({ code: next.verificationState === 'MISMATCH' ? 'ATTESTATION_MISMATCH' : 'ATTESTATION_UNAVAILABLE', message: visibleMessage, retryable: next.verificationState === 'UNAVAILABLE', outcome: 'NOT_SUBMITTED', fieldErrors: [] });
    } catch (error) { setFailure(toFailureState(error)); }
    finally { setChecking(false); }
  };

  const state = attestation?.verificationState ?? 'UNAVAILABLE';
  return (
    <ScreenLayout title={t('failClosed:title')} subtitle={code} bannerText={t('assessment:clinicalTransparencyBanner')} footer={<>
      <ACRButton title={t('common:about')} variant="secondary" onPress={() => navigation.navigate('About')} />
      <ACRButton title={isAttestation ? t('build44:retryVerification') : t('build44:backToAccess')} variant="primary" onPress={handleAction} disabled={checking} />
    </>}>
      <ACRStopBox title={code} message={visibleMessage} />
      <ACRCard title={t('failClosed:verificationDetail')}>
        <Row label={t('failClosed:state')} valueComponent={<ACRStateBadge state={state} />} />
        <Row label={t('failClosed:expectedReasoner')} value="v2.2" />
        <Row label={t('failClosed:observedReasoner')} value={attestation?.observed.reasonerVersion ?? t('common:emDash')} />
        <Row label={t('failClosed:ontologyHash')} value={attestation?.observed.ontologySha256 ?? t('common:emDash')} />
        <Row label={t('failClosed:lastSuccessfulCheck')} value={attestation?.lastSuccessfulVerificationTimestamp ?? t('common:emDash')} />
        <Row label="outcome" value={failure?.outcome ?? 'NOT_SUBMITTED'} />
        {failure?.fieldErrors.length ? <Text style={[styles.hint, localText]}>{failure.fieldErrors.join(', ')}</Text> : null}
        <Text style={[styles.hint, localText]}>{t('failClosed:verificationHint')}</Text>
      </ACRCard>
    </ScreenLayout>
  );
};

const Row: React.FC<{ label: string; value?: string; valueComponent?: React.ReactNode }> = ({ label, value, valueComponent }) => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  return <View style={styles.row}><Text style={[styles.rowLabel, localText]}>{label}</Text>{valueComponent ?? <Text selectable style={[styles.rowValue, localText]}>{value}</Text>}</View>;
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: ACRColors.line, borderStyle: 'dashed' },
  rowLabel: { flex: 1, fontSize: 11, color: ACRColors.ink },
  rowValue: { flex: 1, fontSize: 11, fontWeight: '600', color: ACRColors.ink },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 5 },
});
