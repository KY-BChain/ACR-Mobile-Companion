import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const navigation = useNavigation<NavProp>();
  const { attestation } = useAssessmentStore();

  const state = attestation?.verificationState || 'UNAVAILABLE';
  const lastVerified = attestation?.lastSuccessfulVerificationTimestamp || '—';
  const ontologyHash = attestation?.expected?.ontologySha256 || '—';

  return (
    <ScreenLayout
      title="About"
      subtitle="Build and baseline identity"
      bannerText="ENVIRONMENT: EVALUATION"
      bannerVariant="trial"
      footer={
        <ACRButton title="Close" variant="primary" onPress={() => navigation.goBack()} />
      }
    >
      <ACRCard title="Application">
        <Row label="Marketing version" value="0.1.0" />
        <Row label="Native build" value="42" />
        <Row label="EAS build / profile" value="trial-internal" />
      </ACRCard>

      <ACRCard title="Service">
        <Row label="Gateway" value="gw-v0.1.0" />
        <Row label="Reasoner" value="v2.2.1" />
        <Row label="Response contract" value="m1" />
        <Row label="Reasoning mode" value="OPENLLET_SWRL" />
      </ACRCard>

      <ACRCard title="Baseline attestation">
        <Row
          label="State"
          valueComponent={<ACRStateBadge state={state} />}
        />
        <Row label="Last verified" value={lastVerified} />
        <Text style={styles.hint}>Ontology SHA-256 (observed, read-only mount):</Text>
        <Text style={styles.prov}>{ontologyHash}</Text>
      </ACRCard>

      <ACRCard title="Data handling">
        <Text style={styles.hint}>
          No intentional clinical data at rest. No analytics. Crash reporting disabled for wave one. Over-the-air updates disabled — every change requires a new reviewed build.
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
  },
  prov: {
    ...ACRTypography.monospace,
    fontSize: 9.5,
    color: ACRColors.muted,
    lineHeight: 16,
    wordBreak: 'break-all',
  },
});
