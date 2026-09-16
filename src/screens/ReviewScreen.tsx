import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
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
import { blankFullAssessmentFields, ENTRY_SCREEN_COUNT } from './completeness';
import { matchesDemoCase } from '../store/sampleCase';

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
  // Build 47 (M7): blank values the platform needs for a full assessment, each
  // with a way back to its screen. Submission stays allowed.
  const blanks = blankFullAssessmentFields(store.form, store.p1, store.p2);
  // Build 47 (M9): in a live assessment, a Steps 1–3 value still holding the
  // sample the app opened with is marked, so it is not sent unnoticed.
  const markSamples = store.deliveryChoice === 'LIVE_PLATFORM' && !store.walkthroughOnly;
  const sampleNote = (field: string) => markSamples && !store.edited.includes(field) ? t('build47:sampleNotChanged') : undefined;
  // Build 47 (M12): synthetic demo replays only the unchanged demonstration case.
  const demoChanged = store.deliveryChoice === 'SYNTHETIC_DEMO' && !store.walkthroughOnly && !matchesDemoCase(store.form, store.p1, store.p2);

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
        {/* Build 47: demo mode is named in the same amber as its selection button. */}
        <Row label={t('build44:deliveryMode')} value={store.deliveryChoice === 'LIVE_PLATFORM' ? t('gatewayAccess:liveMode') : t('gatewayAccess:demoMode')} valueColor={store.deliveryChoice === 'SYNTHETIC_DEMO' ? ACRColors.demo : undefined} />
        <Text style={[styles.hint, localText]}>{store.deliveryChoice === 'LIVE_PLATFORM' ? t('build44:liveReviewHint') : t('build44:demoReviewHint')}</Text>
      </ACRCard>

      {/* Build 47 (Kraken, 16 Sept 2026): Review warnings that lead back to a
          screen are highlighted in red. */}
      {demoChanged ? <View style={styles.alertBox}>
        <Text accessibilityRole="header" style={[styles.alertTitle, localText]}>{t('build47:demoChangedTitle')}</Text>
        <Text accessibilityRole="alert" style={[styles.alertText, localText]}>{t('build47:demoChanged')}</Text>
      </View> : null}

      {blanks.length ? <View style={styles.alertBox}>
        <Text accessibilityRole="header" style={[styles.alertTitle, localText]}>{t('build47:neededTitle')}</Text>
        <Text accessibilityRole="alert" style={[styles.alertText, localText]}>{t('build47:neededIntro')}</Text>
        {blanks.map((field) => <Pressable key={field.platformName} accessibilityRole="link" onPress={() => navigation.navigate(field.route)} style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
          <Text style={[styles.linkText, localText]}>{t('build47:goToField', { field: t(field.labelKey), screen: field.screen, total: ENTRY_SCREEN_COUNT })}</Text>
        </Pressable>)}
        <Text style={[styles.alertText, localText]}>{t('build47:neededSubmitAllowed')}</Text>
      </View> : null}

      <ACRCard title={t('review:enteredValues')}>
        <Row label={t('build44:patientId')} value={store.sessionId} />
        <Row label={t('receptors:erStatus')} value={store.form.step1.erStatus} note={sampleNote('erStatus')} />
        <Row label={t('receptors:prStatus')} value={store.form.step1.prStatus} note={sampleNote('prStatus')} />
        <Row label={t('receptors:her2Status')} value={store.form.step1.her2Status} note={sampleNote('her2Status')} />
        <Row label={t('receptors:ki67')} value={value(store.form.step1.ki67, ' %')} note={sampleNote('ki67')} />
        <Row label={t('tumour:stage')} value={value(store.form.step2.stage)} note={sampleNote('stage')} />
        <Row label={t('tumour:grade')} value={value(store.form.step2.grade)} note={sampleNote('grade')} />
        <Row label={t('tumour:histologicalSubtype')} value={value(store.form.step2.histologicalSubtype)} note={sampleNote('histologicalSubtype')} />
        <Row label={t('tumour:nodalStatus')} value={value(store.form.step2.nodalStatus)} note={sampleNote('nodalStatus')} />
        <Row label={t('tumour:age')} value={value(store.form.step2.age, store.form.step2.age ? ` ${t('build44:years')}` : '')} note={sampleNote('age')} />
        <Row label={t('markers:ca153')} value={value(store.form.step3.ca153, store.form.step3.ca153 ? ' U/mL' : '')} note={sampleNote('ca153')} />
        <Row label={t('markers:cea')} value={value(store.form.step3.cea, store.form.step3.cea ? ' ng/mL' : '')} note={sampleNote('cea')} />
        <Row label={t('markers:surgeryDate')} value={value(store.form.step3.surgeryDate)} note={sampleNote('surgeryDate')} />
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

const Row: React.FC<{ label: string; value?: string; valueComponent?: React.ReactNode; note?: string; valueColor?: string }> = ({ label, value, valueComponent, note, valueColor }) => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  // Gates 8-9: grouped so assistive technology announces the label and its
  // value as one item, rather than two unrelated text nodes.
  return <View accessible accessibilityRole="text" accessibilityLabel={`${label}: ${value ?? ''}${note ? `, ${note}` : ''}`} style={styles.row}><Text style={[styles.rowLabel, localText]}>{label}</Text>{valueComponent ?? <View style={styles.rowValueBlock}><Text selectable style={[styles.rowValue, valueColor ? { color: valueColor } : null, localText]}>{value}</Text>{note ? <Text style={[styles.sampleNote, localText]}>{note}</Text> : null}</View>}</View>;
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: ACRColors.line, borderStyle: 'dashed' },
  rowLabel: { flex: 1, fontSize: 11, color: ACRColors.ink },
  rowValue: { fontSize: 11, fontWeight: '600', color: ACRColors.ink },
  rowValueBlock: { flex: 1 },
  sampleNote: { fontSize: 9.5, color: ACRColors.warningText, marginTop: 1 },
  alertBox: { backgroundColor: ACRColors.stopBg, borderWidth: 1.5, borderColor: ACRColors.stopBorder, borderRadius: 12, padding: 12, marginBottom: 10, gap: 4 },
  alertTitle: { ...ACRTypography.cardTitle, color: ACRColors.stopBorder },
  alertText: { fontSize: 11, color: ACRColors.stopText, lineHeight: 16 },
  link: { paddingVertical: 6 },
  linkPressed: { opacity: 0.6 },
  linkText: { fontSize: 11.5, fontWeight: '700', color: ACRColors.stopBorder, textDecorationLine: 'underline' },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 5 },
  muted: { fontSize: 11, color: ACRColors.muted },
});
