import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const lastSuccess = attestation?.lastSuccessfulVerificationTimestamp || '—';

  return (
    <ScreenLayout
      title="Service unavailable"
      subtitle="Baseline verification failed"
      bannerText="Clinical transparency: outputs are decision support only."
      footer={
        <>
          <ACRButton title="About" variant="secondary" onPress={() => navigation.navigate('About')} />
          <ACRButton title="Retry check" variant="primary" onPress={handleRetry} disabled={checking} />
        </>
      }
    >
      <ACRStopBox
        title="Assessment blocked"
        message="The service could not verify that the connected reasoner matches the accepted baseline. No assessment can be submitted until verification succeeds."
      />

      <ACRCard title="Verification detail" style={{ marginTop: 12 }}>
        <Row label="State" valueComponent={<ACRStateBadge state={state} />} />
        <Row label="Expected reasoner" value="v2.2.1" />
        <Row label="Observed reasoner" value={attestation?.observed?.reasonerVersion || '—'} />
        <Row label="Ontology hash" value={attestation?.observed?.ontologySha256 ? 'observed' : 'not observed'} />
        <Row label="Last successful check" value={lastSuccess} />
        <Text style={styles.hint}>
          Expected values come from the accepted baseline manifest; they are never reported as observations.
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
  },
});
