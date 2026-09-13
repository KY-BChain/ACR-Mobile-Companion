import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import { ACRStateBadge, spokenState } from '../components/ACRStateBadge';
import { WalkthroughNotice } from '../components/WalkthroughNotice';
import { ACRColors, ACRTypography } from '../theme/colors';
import { useAssessmentStore } from '../store/assessmentStore';
import { buildAssessmentRequest, AssessmentValidationError } from '../api/requestBuilder';
import { GatewayError, gatewayClient, toFailureState } from '../api/client';
import { generateRequestId } from '../utils/uuid';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const ReviewScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const store = useAssessmentStore();
  const [submitting, setSubmitting] = useState(false);
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  const blank = t('common:emDash');
  const value = (input: string | number | boolean | null, unit = '') => input === null || input === ''
    ? blank
    : `${typeof input === 'boolean' ? (input ? t('common:on') : t('common:off')) : input}${unit}`;

  const fail = (error: unknown) => {
    const failure = toFailureState(error);
    if (['AUTHENTICATION_REQUIRED', 'DEVICE_BINDING_MISMATCH', 'CLIENT_BUILD_MISMATCH', 'TOKEN_REUSE_DETECTED'].includes(failure.code)) {
      gatewayClient.clearSession();
      store.setAccessReady(false);
      store.setAttestation(null);
    }
    store.setResult(null);
    store.setFailure(failure);
    navigation.navigate('FailClosed');
  };

  const handleSubmit = async () => {
    if (store.walkthroughOnly) {
      // Build 46: finishing the walkthrough keeps the saved session.
      store.resetCycle();
      store.setFailure({
        code: 'DEMO_FIXTURE_NOT_AVAILABLE',
        message: t('build44:fixtureUnavailable'),
        retryable: false,
        outcome: 'NOT_SUBMITTED',
        fieldErrors: [],
      });
      navigation.reset({ index: 0, routes: [{ name: 'FailClosed' }] });
      return;
    }
    if (!store.accessReady || !gatewayClient.hasSession()) {
      gatewayClient.clearSession();
      store.setAccessReady(false);
      store.setAttestation(null);
      store.setFailure({ code: 'AUTHENTICATION_REQUIRED', message: t('build44:authExpired'), retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: [] });
      store.setResult(null);
      navigation.navigate('GatewayAccess');
      return;
    }
    setSubmitting(true);
    store.setResult(null);
    store.setFailure(null);
    try {
      if (store.deliveryChoice === 'LIVE_PLATFORM') {
        const attestation = await gatewayClient.checkAttestation();
        store.setAttestation(attestation);
        if (attestation.verificationState !== 'VERIFIED') {
          fail(new GatewayError(
            attestation.verificationState === 'MISMATCH' ? 'ATTESTATION_MISMATCH' : 'ATTESTATION_UNAVAILABLE',
            attestation.verificationState === 'MISMATCH' ? t('build44:baselineMismatch') : t('build44:serverNotConnected'),
            attestation.verificationState === 'UNAVAILABLE', 'NOT_SUBMITTED',
          ));
          return;
        }
      }
      const request = buildAssessmentRequest({ form: store.form, p1: store.p1, p2: store.p2, patientId: store.sessionId, requestId: generateRequestId() });
      const response = await gatewayClient.submit(request, store.deliveryChoice);
      store.setResult(response);
      navigation.navigate('Result');
    } catch (error) {
      if (error instanceof AssessmentValidationError) {
        store.setFailure({ code: 'CLINICAL_INPUT_REJECTED', message: t('build44:validationError'), retryable: false, outcome: 'NOT_SUBMITTED', fieldErrors: error.fieldErrors });
        store.setResult(null);
        navigation.navigate('FailClosed');
      } else fail(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title={t('review:title')} subtitle={t('review:subtitle')} bannerText={t('assessment:clinicalTransparencyBanner')} footer={<>
      <ACRButton title={t('common:edit')} variant="secondary" onPress={() => navigation.navigate('Step1')} />
      <ACRButton title={store.walkthroughOnly ? t('gatewayAccess:finishWalkthrough') : t('common:submit')} variant="primary" disabled={submitting || (!store.accessReady && !store.walkthroughOnly)} onPress={handleSubmit} />
    </>}>
      <WalkthroughNotice />
      <ACRCard title={t('build44:deliveryMode')}>
        <Row label={t('build44:deliveryMode')} value={store.deliveryChoice === 'LIVE_PLATFORM' ? t('gatewayAccess:liveMode') : t('gatewayAccess:demoMode')} />
        <Text style={[styles.hint, localText]}>{store.deliveryChoice === 'LIVE_PLATFORM' ? t('build44:liveReviewHint') : t('build44:demoReviewHint')}</Text>
      </ACRCard>

      <ACRCard title={t('review:enteredValues')}>
        <Row label={t('build44:patientId')} value={store.sessionId} />
        <Row label={t('receptors:erStatus')} value={store.form.step1.erStatus} />
        <Row label={t('receptors:prStatus')} value={store.form.step1.prStatus} />
        <Row label={t('receptors:her2Status')} value={store.form.step1.her2Status} />
        <Row label={t('receptors:ki67')} value={value(store.form.step1.ki67, ' %')} />
        <Row label={t('tumour:stage')} value={value(store.form.step2.stage)} />
        <Row label={t('tumour:grade')} value={value(store.form.step2.grade)} />
        <Row label={t('tumour:histologicalSubtype')} value={value(store.form.step2.histologicalSubtype)} />
        <Row label={t('tumour:nodalStatus')} value={value(store.form.step2.nodalStatus)} />
        <Row label={t('tumour:age')} value={value(store.form.step2.age, store.form.step2.age ? ` ${t('build44:years')}` : '')} />
        <Row label={t('markers:ca153')} value={value(store.form.step3.ca153, store.form.step3.ca153 ? ' U/mL' : '')} />
        <Row label={t('markers:cea')} value={value(store.form.step3.cea, store.form.step3.cea ? ' ng/mL' : '')} />
        <Row label={t('markers:surgeryDate')} value={value(store.form.step3.surgeryDate)} />
        <Row label={t('review:bayesianLayer')} value={value(store.form.step3.bayesianEnhanced)} />
      </ACRCard>

      <ACRCard title={t('review:p1Title')}>
        <Row label={t('p1:tumorSize')} value={value(store.p1.tumorSize, store.p1.tumorSize ? ` ${t('build44:tumorUnitPending')}` : '')} />
        <Row label={t('p1:gender')} value={value(store.p1.gender)} />
        <Text style={[styles.hint, localText]}>{t('review:provisionalHint')}</Text>
      </ACRCard>

      <ACRCard title={t('review:p2Title')}>
        <Row label={t('p2:ecogScore')} value={value(store.p2.ecogScore)} />
        <Row label={t('p2:pdl1Status')} value={value(store.p2.pdl1Status)} />
        <Row label={t('p2:her2Low')} value={value(store.p2.her2Low)} />
        <Row label={t('p2:lvef')} value={value(store.p2.lvef, store.p2.lvef ? ' %' : '')} />
        <Row label={t('p2:treatmentIntent')} value={value(store.p2.treatmentIntent)} />
        <Text style={[styles.hint, localText]}>{t('build44:her2Loss')} {t('p2:unknown')} / {blank} → null.</Text>
      </ACRCard>

      <ACRCard title={t('review:baseline')}>
        {/* value is what the screen reader speaks; the badge is what is seen. */}
        <Row label={t('review:attestation')} value={store.attestation ? spokenState(store.attestation.verificationState) : t('common:unavailable')} valueComponent={store.attestation ? <ACRStateBadge state={store.attestation.verificationState} /> : <Text style={[styles.muted, localText]}>{t('common:unavailable')}</Text>} />
        <Text style={[styles.hint, localText]}>{t('review:baselineHint')}</Text>
      </ACRCard>
    </ScreenLayout>
  );
};

const Row: React.FC<{ label: string; value?: string; valueComponent?: React.ReactNode }> = ({ label, value, valueComponent }) => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  // Gates 8-9: grouped so assistive technology announces the label and its
  // value as one item, rather than two unrelated text nodes.
  return <View accessible accessibilityRole="text" accessibilityLabel={`${label}: ${value ?? ''}`} style={styles.row}><Text style={[styles.rowLabel, localText]}>{label}</Text>{valueComponent ?? <Text selectable style={[styles.rowValue, localText]}>{value}</Text>}</View>;
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: ACRColors.line, borderStyle: 'dashed' },
  rowLabel: { flex: 1, fontSize: 11, color: ACRColors.ink },
  rowValue: { flex: 1, fontSize: 11, fontWeight: '600', color: ACRColors.ink },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 5 },
  muted: { fontSize: 11, color: ACRColors.muted },
});
