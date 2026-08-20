import React, { useState } from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import { ACRStateBadge } from '../components/ACRStateBadge';
import { useAssessmentStore } from '../store/assessmentStore';
import { checkAttestation } from '../api/attestation';
import { submitAssessment } from '../api/infer';
import { generateRequestId } from '../utils/uuid';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const ReviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { form, p1, p2, sessionId, attestation, setAttestation, setResult, reset } = useAssessmentStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVerified = attestation?.verificationState === 'VERIFIED';

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const att = await checkAttestation();
      setAttestation(att);

      if (att.verificationState !== 'VERIFIED') {
        navigation.navigate('FailClosed');
        setSubmitting(false);
        return;
      }

      const request = {
        contract: 'acr.cds.v1' as const,
        requestId: generateRequestId(),
        assessment: {
          patientId: sessionId,
          erStatus: form.step1.erStatus,
          prStatus: form.step1.prStatus,
          her2Status: form.step1.her2Status,
          ki67: Number(form.step1.ki67),
          stage: form.step2.stage || null,
          grade: form.step2.grade || null,
          histologicalSubtype: form.step2.histologicalSubtype || null,
          nodalStatus: form.step2.nodalStatus || null,
          age: form.step2.age ? Number(form.step2.age) : null,
          ca153: form.step3.ca153 ? Number(form.step3.ca153) : null,
          cea: form.step3.cea ? Number(form.step3.cea) : null,
          surgeryDate: form.step3.surgeryDate || null,
          bayesianEnhanced: form.step3.bayesianEnhanced,
        },
        client: {
          channel: 'MOBILE' as const,
          buildId: 'mob-v0.1.0+42',
          environment: 'EVALUATION' as const,
        },
      };

      const response = await submitAssessment(request);
      setResult(response);
      navigation.navigate('Result');
    } catch (err: any) {
      setError(err.message || t('review:submissionFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout
      title={t('review:title')}
      subtitle={t('review:subtitle')}
      bannerText={t('assessment:clinicalTransparencyBanner')}
      footer={
        <>
          <ACRButton title={t('common:edit')} variant="secondary" onPress={() => navigation.navigate('Step1')} />
          <ACRButton
            title={t('common:submit')}
            variant="primary"
            disabled={!isVerified || submitting}
            onPress={handleSubmit}
          />
        </>
      }
    >
      <ACRCard title={t('review:enteredValues')}>
        <Row label={t('review:erPrHer2')} value={`${form.step1.erStatus.slice(0,3)} / ${form.step1.prStatus.slice(0,3)} / ${form.step1.her2Status.slice(0,3)}`} />
        <Row label={t('review:ki67')} value={`${form.step1.ki67} %`} />
        <Row label={t('review:stageGrade')} value={`${form.step2.stage || t('common:emDash')} / ${form.step2.grade || t('common:emDash')}`} />
        <Row label={t('review:histology')} value={form.step2.histologicalSubtype || t('common:emDash')} />
        <Row label={t('review:nodalStatus')} value={form.step2.nodalStatus || t('common:emDash')} />
        <Row label={t('review:age')} value={form.step2.age || t('common:emDash')} />
        <Row label={t('review:ca153Cea')} value={`${form.step3.ca153 || t('common:emDash')} / ${form.step3.cea || t('common:emDash')}`} />
        <Row label={t('review:surgeryDate')} value={form.step3.surgeryDate || t('common:emDash')} />
      </ACRCard>

      <ACRCard title={t('review:reasoningOptions')}>
        <Row label={t('review:bayesianLayer')} value={form.step3.bayesianEnhanced ? t('common:on') : t('common:off')} />
        <Text style={styles.hint}>{t('review:bayesianHint')}</Text>
      </ACRCard>

      <ACRCard title={t('review:p1Title')}>
        <Row label={t('p1:tumorSize')} value={p1.tumorSize || t('common:emDash')} />
        <Row label={t('p1:gender')} value={p1.gender || t('common:emDash')} />
        <Text style={styles.hint}>{t('review:provisionalHint')}</Text>
      </ACRCard>

      <ACRCard title={t('review:p2Title')}>
        <Row label={t('p2:ecogScore')} value={p2.ecogScore || t('common:emDash')} />
        <Row label={t('p2:pdl1Status')} value={p2.pdl1Status || t('common:emDash')} />
        <Row label={t('p2:her2Low')} value={p2.her2Low || t('common:emDash')} />
        <Row label={t('p2:lvef')} value={p2.lvef || t('common:emDash')} />
        <Row label={t('p2:treatmentIntent')} value={p2.treatmentIntent || t('common:emDash')} />
        <Text style={styles.hint}>{t('review:provisionalHint')}</Text>
      </ACRCard>

      <ACRCard title={t('review:baseline')}>
        <Row
          label={t('review:attestation')}
          valueComponent={
            attestation ? (
              <ACRStateBadge state={attestation.verificationState} />
            ) : (
              <Text style={styles.muted}>{t('review:checking')}</Text>
            )
          }
        />
        <Text style={styles.hint}>{t('review:baselineHint')}</Text>
      </ACRCard>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
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
  muted: {
    fontSize: 11,
    color: ACRColors.muted,
  },
  errorBox: {
    backgroundColor: ACRColors.stopBg,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  errorText: {
    color: ACRColors.stopBorder,
    fontSize: 11,
  },
});