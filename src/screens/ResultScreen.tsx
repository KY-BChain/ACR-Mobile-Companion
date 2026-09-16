import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import { ACRBadge } from '../components/ACRBadge';
import { ACRColors, ACRTypography } from '../theme/colors';
import { useAssessmentStore } from '../store/assessmentStore';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { buildClinicalResultPresentation, formatReturnedProbability, resultValueTone, TECHNICAL_DETAILS_DEFAULT_EXPANDED } from './resultPresentation';
import { ENTRY_SCREEN_COUNT, firstEntryRoute, fullAssessmentField, isRiskWithheld } from './completeness';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const ResultScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { result, resetCycle } = useAssessmentStore();
  const [technicalDetailsExpanded, setTechnicalDetailsExpanded] = useState(TECHNICAL_DETAILS_DEFAULT_EXPANDED);
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  // "New assessment" ends the assessment cycle only. Evaluation access ends
  // solely through Disconnect or a gateway refusal, so an evaluator is not
  // locked out after one assessment by a single-use invitation.
  const done = () => {
    resetCycle();
    navigation.reset({ index: 0, routes: [{ name: 'GatewayAccess' }] });
  };
  if (!result) return <View style={styles.empty}><Text style={[styles.emptyText, localText]}>{t('result:noResult')}</Text><ACRButton title={t('result:newAssessment')} variant="primary" onPress={done} /></View>;

  const data = result.data;
  const modeLabel = result.resultMode === 'LIVE_REASONER' ? t('build44:liveResult')
    : result.resultMode === 'PLATFORM_FALLBACK' ? t('build44:fallbackResult') : t('build44:demoResult');
  const current = result.delivery.currentPlatformEvidence;
  const captured = result.delivery.capturedPlatform;
  const presentation = buildClinicalResultPresentation(result);
  const none = t('build44:noneReturned');
  const list = (items: string[]) => items.length ? items.map((item, index) => <Text key={`${item}-${index}`} style={[styles.listItem, localText]}>• {item}</Text>) : <Text style={[styles.hint, localText]}>{none}</Text>;
  // Build 47 (M1–M4): an incomplete case says in the reader's language what the
  // platform needs and where to enter it, and returns there with every value
  // kept. T1's own completeness text stays visible, unchanged, in the warnings.
  const completeness = data.dataCompleteness;
  const incomplete = completeness.tier < 3;
  const riskWithheld = isRiskWithheld(data);
  const fieldName = (name: string) => { const field = fullAssessmentField(name); return field ? t(field.labelKey) : name; };
  const fieldOnScreen = (name: string) => {
    const field = fullAssessmentField(name);
    return field ? t('build47:fieldOnScreen', { field: t(field.labelKey), screen: field.screen, total: ENTRY_SCREEN_COUNT }) : name;
  };
  const completeMissing = () => navigation.navigate(firstEntryRoute(completeness.missingFields));

  return (
    <ScreenLayout title={t('result:title')} subtitle={modeLabel} bannerText={t('assessment:clinicalTransparencyBanner')} footer={<>
      <ACRButton title={t('result:newAssessment')} variant="secondary" onPress={done} />
      <ACRButton title={t('common:done')} variant="primary" onPress={done} />
    </>}>
      <View style={styles.summaryHeading}>
        <Text style={[styles.summaryHeadingText, localText]}>{t('result:clinicalSummary')}</Text>
        <Text style={[styles.summarySource, localText]}>{t(presentation.sourceCopyKey)}</Text>
      </View>

      <View style={styles.subtypeBox}>
        <Text style={[styles.subtypeLabel, localText]}>{t('result:molecularSubtype')}</Text>
        <Text selectable style={[styles.subtypeValue, toneStyle(data.molecularSubtype), localText]}>{data.molecularSubtype}</Text>
        <Text selectable style={[styles.subtypeText, localText]}>{t('build44:risk')}: {riskWithheld
          ? <Text style={styles.riskWithheld}>{t('build47:riskWithheld', { fields: completeness.missingFields.map(fieldName).join(', ') })}</Text>
          : <Text style={[styles.riskValue, toneStyle(data.riskLevel)]}>{data.riskLevel ?? t('common:emDash')}</Text>}</Text>
      </View>

      {incomplete ? <View style={styles.noticeBox}>
        <Text accessibilityRole="header" style={[styles.noticeTitle, localText]}>{t('build47:notFullTitle')}</Text>
        <Text style={[styles.noticeText, localText]}>{t('build47:platformNeeds')}</Text>
        {completeness.missingFields.map((name) => <Text key={name} style={[styles.listItem, localText]}>• {fieldOnScreen(name)}</Text>)}
        {riskWithheld ? <Text style={[styles.noticeText, localText]}>{t('build47:riskWithheldNotice')}</Text> : null}
        <ACRButton title={t('build47:completeMissing')} variant="secondary" onPress={completeMissing} />
        <Text style={[styles.hint, localText]}>{t('build47:completeMissingHint')}</Text>
      </View> : null}

      {presentation.warnings.length ? <View style={styles.warningBox}>
        <Text style={[styles.warningTitle, localText]}>{t('result:warningsAndContext')}</Text>
        {list(presentation.warnings)}
      </View> : null}

      <ACRCard title={t('result:informationCompleteness')}>
        <Row label={t('build44:tier')} value={String(data.dataCompleteness.tier)} />
        <Text style={[styles.sectionLabel, localText]}>{t('build44:missingFields')}</Text>
        {list(data.dataCompleteness.missingFields.map(fieldOnScreen))}
      </ACRCard>

      <ACRCard title={t('result:treatmentOptions')}>{list(presentation.treatments)}</ACRCard>

      <ACRCard title={t('result:biomarkerResults')}>
        {Object.entries(data.deterministic.biomarkers).length ? Object.entries(data.deterministic.biomarkers).map(([key, value]) => <Row key={key} label={key} value={value} />) : <Text style={[styles.hint, localText]}>{none}</Text>}
      </ACRCard>

      {presentation.showBayesianSummary ? <ACRCard title={t('result:confidenceSummary')}>
        <Row label={t('result:classificationConfidence')} value={formatReturnedProbability(data.bayesian.confidence)} />
        <Row label={t('build44:uncertainty')} value={`${formatReturnedProbability(data.bayesian.uncertaintyBounds[0])} – ${formatReturnedProbability(data.bayesian.uncertaintyBounds[1])}`} />
        <Text style={[styles.sectionLabel, localText]}>{t('build44:posterior')}</Text>
        {Object.entries(data.bayesian.posterior).length ? Object.entries(data.bayesian.posterior).map(([key, value]) => <Row key={key} label={key} value={formatReturnedProbability(value)} />) : <Text style={[styles.hint, localText]}>{none}</Text>}
      </ACRCard> : <ACRCard title={t('result:confidenceSummary')}>
        <Text style={[styles.hint, localText]}>{t('result:noBayesianEnhancement')}</Text>
      </ACRCard>}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: technicalDetailsExpanded }}
        accessibilityLabel={technicalDetailsExpanded ? t('result:hideTechnicalDetails') : t('result:showTechnicalDetails')}
        onPress={() => setTechnicalDetailsExpanded((expanded) => !expanded)}
        style={({ pressed }) => [styles.technicalToggle, pressed && styles.technicalTogglePressed]}
      >
        <Text style={[styles.technicalToggleText, localText]}>
          {technicalDetailsExpanded ? '▼' : '▶'} {t('result:technicalDetails')}
        </Text>
        <Text style={[styles.technicalToggleHint, localText]}>
          {technicalDetailsExpanded ? t('result:hideTechnicalDetails') : t('result:showTechnicalDetails')}
        </Text>
      </Pressable>

      {technicalDetailsExpanded ? <View accessibilityLabel={t('result:technicalDetails')}>
      <ACRCard title={t('result:resultIdentity')}>
        <Row label={t('result:resultMode')} value={result.resultMode} />
        <Row label={t('result:reasoningMode')} value={result.reasoningMode} />
        <Row label={t('result:executionStatus')} value={result.delivery.currentExecution ? t('build44:currentExecution') : t('build44:noCurrentExecution')} />
        <Row label={t('result:molecularSubtype')} value={data.molecularSubtype} />
        <Row label={t('result:rootRisk')} value={data.riskLevel ?? t('common:emDash')} />
        {/* Build 47 (M5): while T1 withholds the headline risk, the nested field is not an assessed risk (Gate 1 OBS-4). */}
        <Row label={riskWithheld ? `${t('result:deterministicRisk')} ${t('build47:notAssessedRisk')}` : t('result:deterministicRisk')} value={data.deterministic.riskLevel ?? t('common:emDash')} muted={riskWithheld} />
        <Row label={t('result:timestamp')} value={data.timestamp} />
        <Row label={t('build44:patientId')} value={data.patientId} />
      </ACRCard>

      <ACRCard title={t('build44:treatments')}>{list(data.deterministic.treatments)}</ACRCard>

      <ACRCard title={t('build44:biomarkers')}>
        {Object.entries(data.deterministic.biomarkers).length ? Object.entries(data.deterministic.biomarkers).map(([key, value]) => <Row key={key} label={key} value={value} />) : <Text style={[styles.hint, localText]}>{none}</Text>}
      </ACRCard>

      <ACRCard title={t('build44:firedRules')}>
        {data.reasoning.firedRules.length ? data.reasoning.firedRules.map((rule) => <View key={rule.ruleId} style={styles.rule}>
          <Text selectable style={[styles.ruleId, localText]}>{rule.ruleId} · {rule.status}</Text>
          <Text selectable style={[styles.ruleText, localText]}>{rule.label}</Text>
          <ACRBadge provenance={rule.provenance} />
        </View>) : <Text style={[styles.hint, localText]}>{none}</Text>}
        <Text style={[styles.sectionLabel, localText]}>{t('result:rulesFired')}</Text>
        {list(data.reasoning.rulesFired)}
      </ACRCard>

      <ACRCard title={t('build44:evidence')}>
        {list(data.reasoning.evidence)}
        <Text style={[styles.sectionLabel, localText]}>{t('build44:trace')}</Text>
        <Text selectable style={[styles.mono, localText]}>{data.reasoning.trace || none}</Text>
      </ACRCard>

      <ACRCard title={t('build44:completeness')}>
        <Row label={t('build44:tier')} value={String(data.dataCompleteness.tier)} />
        <Row label={t('build47:rulesBlockedFixed')} value={String(data.dataCompleteness.rulesBlocked)} />
        <Text style={[styles.sectionLabel, localText]}>{t('build44:missingFields')}</Text>
        {list(data.dataCompleteness.missingFields)}
        <Text style={[styles.sectionLabel, localText]}>{t('build44:warnings')}</Text>
        {list([data.dataCompleteness.warning, ...result.warnings].filter(Boolean))}
      </ACRCard>

      <ACRCard title={t('build44:bayesian')}>
        <Row label={t('common:on')} value={data.bayesian.enabled ? t('common:yes') : t('common:no')} />
        <Row label={t('result:bayesianConfidence')} value={String(data.bayesian.confidence)} />
        <Row label={t('build44:uncertainty')} value={`${data.bayesian.uncertaintyBounds[0]} – ${data.bayesian.uncertaintyBounds[1]}`} />
        <Text style={[styles.sectionLabel, localText]}>{t('build44:posterior')}</Text>
        {Object.entries(data.bayesian.posterior).length ? Object.entries(data.bayesian.posterior).map(([key, value]) => <Row key={key} label={key} value={String(value)} />) : <Text style={[styles.hint, localText]}>{none}</Text>}
      </ACRCard>

      <ACRCard title={t('build44:currentEvidence')}>
        <Row label={t('failClosed:state')} value={result.delivery.currentVerificationState} />
        <Row label={t('result:reasonerVersion')} value={current.reasonerVersion ?? t('common:emDash')} />
        <Row label={t('result:reasoningMode')} value={current.reasoningMode ?? t('common:emDash')} />
        <Row label={t('result:ontologySHA256')} value={current.ontologySha256 ?? t('common:emDash')} />
        <Row label="logical / physical / active / loaded / query" value={`${current.logicalRuleCount ?? '—'} / ${current.physicalRuleCount ?? '—'} / ${current.activeRuleCount ?? '—'} / ${current.loadedRuleCount ?? '—'} / ${current.queryCount ?? '—'}`} />
      </ACRCard>

      {captured ? <ACRCard title={t('build44:capturedEvidence')}>
        <Row label={t('result:reasoningMode')} value={captured.reasoningMode} />
        <Row label={t('result:timestamp')} value={captured.provenance.capturedAt} />
        <Row label="captureRoute" value={captured.provenance.captureRoute} />
        <Row label={t('result:reasonerVersion')} value={captured.provenance.reasonerVersion} />
        <Row label={t('result:ontologySHA256')} value={captured.provenance.ontologySha256} />
        <Row label="logical / physical / active / loaded / query" value={`${captured.provenance.logicalRuleCount} / ${captured.provenance.physicalRuleCount} / ${captured.provenance.activeRuleCount} / ${captured.provenance.loadedRuleCount} / ${captured.provenance.queryCount}`} />
      </ACRCard> : null}

      <ACRCard title={t('result:retention')}><Text style={[styles.hint, localText]}>{t('result:retentionHint')}</Text></ACRCard>
      </View> : null}
    </ScreenLayout>
  );
};

// Build 46: every returned value is colour-coded — red HIGH/positive, green
// LOW/negative, blue otherwise (see resultValueTone). The text itself still
// carries the value, so colour is never the only signal.
const TONE_COLOUR = { high: ACRColors.resultHigh, low: ACRColors.resultLow, other: ACRColors.resultOther } as const;
const toneStyle = (value: string | null | undefined) => ({ color: TONE_COLOUR[resultValueTone(value)] });

const Row: React.FC<{ label: string; value: string; muted?: boolean }> = ({ label, value, muted }) => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  return <View style={styles.row}><Text style={[styles.rowLabel, localText]}>{label}</Text><Text selectable style={[styles.rowValue, muted ? styles.mutedValue : toneStyle(value), localText]}>{value}</Text></View>;
};

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: ACRColors.background },
  emptyText: { color: ACRColors.muted, marginBottom: 16 },
  summaryHeading: { backgroundColor: ACRColors.primaryDark, borderRadius: 12, padding: 14, marginBottom: 10 },
  summaryHeadingText: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 5 },
  summarySource: { fontSize: 11, color: '#fff', lineHeight: 16 },
  subtypeBox: { backgroundColor: ACRColors.card, borderWidth: 2, borderColor: ACRColors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  subtypeLabel: { ...ACRTypography.subtypeLabel, color: ACRColors.muted },
  subtypeValue: { ...ACRTypography.subtypeValue, color: ACRColors.primary, marginVertical: 5 },
  subtypeText: { fontSize: 11, color: ACRColors.ink },
  riskValue: { fontWeight: '700' },
  riskWithheld: { fontWeight: '700', color: ACRColors.muted },
  noticeBox: { backgroundColor: ACRColors.card, borderWidth: 1.5, borderColor: ACRColors.warningBorder, borderRadius: 12, padding: 12, marginBottom: 10, gap: 6 },
  noticeTitle: { ...ACRTypography.cardTitle, color: ACRColors.warningText },
  noticeText: { fontSize: 11, color: ACRColors.ink, lineHeight: 16 },
  mutedValue: { color: ACRColors.muted, fontWeight: '400' },
  warningBox: { backgroundColor: ACRColors.warningBg, borderWidth: 1.5, borderColor: ACRColors.warningBorder, borderRadius: 12, padding: 12, marginBottom: 10 },
  warningTitle: { ...ACRTypography.cardTitle, color: ACRColors.warningText, marginBottom: 7 },
  technicalToggle: { backgroundColor: ACRColors.primary, borderRadius: 12, padding: 12, marginTop: 2, marginBottom: 10 },
  technicalTogglePressed: { opacity: 0.8 },
  technicalToggleText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  technicalToggleHint: { fontSize: 9.5, color: '#fff', marginTop: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, borderBottomWidth: 1, borderBottomColor: ACRColors.line, paddingVertical: 5 },
  rowLabel: { flex: 1, fontSize: 10.5, color: ACRColors.ink },
  rowValue: { flex: 1, fontSize: 10.5, fontWeight: '600', color: ACRColors.ink },
  rule: { borderLeftWidth: 3, borderLeftColor: ACRColors.line, paddingLeft: 9, paddingVertical: 6, marginBottom: 8 },
  ruleId: { fontSize: 11, fontWeight: '700', color: ACRColors.primaryDark },
  ruleText: { fontSize: 10.5, color: ACRColors.ink, marginVertical: 3 },
  listItem: { fontSize: 10.5, color: ACRColors.ink, lineHeight: 16 },
  sectionLabel: { ...ACRTypography.label, color: ACRColors.primaryDark, marginTop: 10, marginBottom: 3 },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 4 },
  mono: { ...ACRTypography.monospace, fontSize: 9.5, color: ACRColors.muted, lineHeight: 15 },
});
