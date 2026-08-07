import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRButton } from '../components/ACRButton';
import { ACRBadge } from '../components/ACRBadge';
import { useAssessmentStore } from '../store/assessmentStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { result, reset } = useAssessmentStore();

  if (!result) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No result available.</Text>
        <ACRButton title="New assessment" variant="primary" onPress={() => { reset(); navigation.navigate('Welcome'); }} />
      </View>
    );
  }

  const data = result.data;

  return (
    <ScreenLayout
      title="Assessment result"
      subtitle="Server-side reasoning · synthetic profile"
      bannerText="Clinical transparency: this output is decision support only. Clinical judgement remains with the clinician."
      footer={
        <>
          <ACRButton
            title="New assessment"
            variant="secondary"
            onPress={() => { reset(); navigation.navigate('Welcome'); }}
          />
          <ACRButton title="Done" variant="primary" onPress={() => { reset(); navigation.navigate('Welcome'); }} />
        </>
      }
    >
      {/* Subtype */}
      <View style={styles.subtypeBox}>
        <Text style={styles.subtypeLabel}>Molecular subtype</Text>
        <Text style={styles.subtypeValue}>{data.molecularSubtype.code}</Text>
        <Text style={styles.subtypeText}>{data.molecularSubtype.display}</Text>
      </View>

      {/* Bayesian */}
      <ACRCard title="Bayesian confidence">
        <Text style={styles.confValue}>{data.bayesian.confidence.toString()}</Text>
        <Text style={styles.hint}>Moderate confidence. Full precision shown as a visible integrity check.</Text>
      </ACRCard>

      {/* Rules fired */}
      <ACRCard title="Rules fired">
        {data.reasoning.rulesFired.map((rule) => (
          <View key={rule.ruleId} style={styles.rule}>
            <Text style={styles.ruleId}>{rule.ruleId}</Text>
            <Text style={styles.ruleDesc}>{rule.description}</Text>
            <ACRBadge provenance={rule.provenance} />
          </View>
        ))}
        <Text style={styles.hint}>Only rules that actually fired are listed.</Text>
      </ACRCard>

      {/* Recommendations */}
      <ACRCard title="Recommendations">
        {data.recommendations.map((rec) => (
          <View key={rec.code} style={styles.rule}>
            <Text style={styles.ruleDesc}>
              <Text style={styles.bold}>{rec.code}:</Text> {rec.text}
            </Text>
          </View>
        ))}
        <Text style={styles.hint}>Text is returned by the reasoner and rendered unchanged.</Text>
      </ACRCard>

      {/* Provenance */}
      <ACRCard title="Reasoning provenance">
        <Text style={styles.prov}>
          {`reasoningMode: ${data.reasoning.reasoningMode}
reasoner: ${data.provenance.reasonerVersion}
responseContract: ${data.provenance.responseContract}
timestamp: ${result.completedAt}
buildId: mob-v0.1.0 (42)
ontologySHA256: ${data.provenance.ontologySha256.substring(0, 16)}… `}
          <Text style={styles.tapHint}>▸ tap to expand</Text>
        </Text>
      </ACRCard>

      {/* Retention */}
      <ACRCard title="Retention">
        <Text style={styles.hint}>
          This result is held in memory only. Leaving this screen clears the assessment. Nothing is written to device storage.
        </Text>
      </ACRCard>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: ACRColors.background,
  },
  emptyText: {
    color: ACRColors.muted,
    marginBottom: 16,
  },
  subtypeBox: {
    backgroundColor: ACRColors.card,
    borderWidth: 2,
    borderColor: ACRColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  subtypeLabel: {
    ...ACRTypography.subtypeLabel,
    color: ACRColors.muted,
  },
  subtypeValue: {
    ...ACRTypography.subtypeValue,
    color: ACRColors.primary,
    marginVertical: 5,
    textAlign: 'center',
  },
  subtypeText: {
    fontSize: 10,
    color: ACRColors.ink,
  },
  confValue: {
    ...ACRTypography.confValue,
    color: ACRColors.primaryDark,
    marginBottom: 4,
  },
  hint: {
    ...ACRTypography.hint,
    color: ACRColors.muted,
    marginTop: 4,
  },
  rule: {
    borderLeftWidth: 3,
    borderLeftColor: ACRColors.line,
    paddingLeft: 9,
    paddingVertical: 6,
    marginBottom: 8,
  },
  ruleId: {
    fontSize: 11.5,
    fontWeight: '700',
    color: ACRColors.primaryDark,
  },
  ruleDesc: {
    fontSize: 10.5,
    color: ACRColors.ink,
    marginVertical: 2,
    lineHeight: 15,
  },
  bold: {
    fontWeight: '700',
  },
  prov: {
    ...ACRTypography.monospace,
    fontSize: 9.5,
    color: ACRColors.muted,
    lineHeight: 16,
  },
  tapHint: {
    fontWeight: '700',
  },
});
