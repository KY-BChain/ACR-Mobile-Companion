#!/bin/zsh
# ACR Mobile Companion v0.5 P1/P2 Update Script
# Run from: ~/DAPP/acr-mobile-companion
# Usage: zsh apply-v0.5-update.sh

set -euo pipefail

PROJECT_DIR="${HOME}/DAPP/acr-mobile-companion"

if [[ "$(pwd)" != "${PROJECT_DIR}" ]]; then
  echo "ERROR: Please run this script from ${PROJECT_DIR}"
  echo "  cd ${PROJECT_DIR}"
  echo "  zsh apply-v0.5-update.sh"
  exit 1
fi

echo "ACR Mobile v0.5 P1/P2 Update"
echo "=============================="
echo ""

# Create backup directory
BACKUP_DIR=".backup-v0.5-$(date +%Y%m%d-%H%M%S)"
mkdir -p "${BACKUP_DIR}"
echo "Backup directory: ${BACKUP_DIR}"

backup_file() {
  local file="$1"
  if [[ -f "${file}" ]]; then
    cp "${file}" "${BACKUP_DIR}/$(basename ${file})"
  fi
}

# ─── 1. assessmentStore.ts ───
backup_file "src/store/assessmentStore.ts"
cat > src/store/assessmentStore.ts << 'EOFSTORE'
import { create } from 'zustand';

export interface Step1State {
  erStatus: 'positive' | 'negative';
  prStatus: 'positive' | 'negative';
  her2Status: 'positive' | 'negative';
  ki67: string;
}

export interface Step2State {
  stage: string;
  grade: '1' | '2' | '3' | '';
  histologicalSubtype: string;
  nodalStatus: 'N0' | 'N1' | 'N2' | 'N3' | '';
  age: string;
}

export interface Step3State {
  ca153: string;
  cea: string;
  surgeryDate: string;
  bayesianEnhanced: boolean;
}

export interface P1State {
  tumorSize: string;
  gender: 'female' | 'male' | 'other' | 'unknown' | '';
}

export interface P2State {
  ecogScore: string;
  pdl1Status: 'positive' | 'negative' | 'not_tested' | '';
  her2Low: 'positive' | 'negative' | 'unknown' | '';
  lvef: string;
  treatmentIntent: 'neoadjuvant' | 'adjuvant' | 'unspecified' | '';
}

export interface AssessmentForm {
  step1: Step1State;
  step2: Step2State;
  step3: Step3State;
  p1: P1State;
  p2: P2State;
}

export interface AttestationState {
  verificationState: 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE';
  expectedReasoner?: string;
  observedReasoner?: string;
  ontologyHash?: string;
  lastSuccessfulCheck?: string;
}

export interface AssessmentResult {
  molecularSubtype: string;
  bayesianConfidence: number;
  rulesFired: string[];
  recommendations: string[];
  provenance: {
    reasoningMode: string;
    reasonerVersion: string;
    responseContract: string;
    timestamp: string;
    buildId: string;
    ontologySHA256: string;
  };
}

interface AssessmentStore {
  form: AssessmentForm;
  sessionId: string;
  attestation: AttestationState | null;
  result: AssessmentResult | null;

  setStep1: (partial: Partial<Step1State>) => void;
  setStep2: (partial: Partial<Step2State>) => void;
  setStep3: (partial: Partial<Step3State>) => void;
  setP1: (partial: Partial<P1State>) => void;
  setP2: (partial: Partial<P2State>) => void;

  setSessionId: (id: string) => void;
  setAttestation: (att: AttestationState | null) => void;
  setResult: (res: AssessmentResult | null) => void;
  reset: () => void;
}

const initialForm: AssessmentForm = {
  step1: { erStatus: 'positive', prStatus: 'positive', her2Status: 'positive', ki67: '' },
  step2: { stage: '', grade: '', histologicalSubtype: '', nodalStatus: '', age: '' },
  step3: { ca153: '', cea: '', surgeryDate: '', bayesianEnhanced: false },
  p1: { tumorSize: '', gender: '' },
  p2: { ecogScore: '', pdl1Status: '', her2Low: '', lvef: '', treatmentIntent: '' },
};

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  form: { ...initialForm },
  sessionId: '',
  attestation: null,
  result: null,

  setStep1: (partial) => set((state) => ({
    form: { ...state.form, step1: { ...state.form.step1, ...partial } },
  })),
  setStep2: (partial) => set((state) => ({
    form: { ...state.form, step2: { ...state.form.step2, ...partial } },
  })),
  setStep3: (partial) => set((state) => ({
    form: { ...state.form, step3: { ...state.form.step3, ...partial } },
  })),
  setP1: (partial) => set((state) => ({
    form: { ...state.form, p1: { ...state.form.p1, ...partial } },
  })),
  setP2: (partial) => set((state) => ({
    form: { ...state.form, p2: { ...state.form.p2, ...partial } },
  })),

  setSessionId: (id) => set({ sessionId: id }),
  setAttestation: (att) => set({ attestation: att }),
  setResult: (res) => set({ result: res }),

  reset: () => set({
    form: { ...initialForm },
    sessionId: '',
    attestation: null,
    result: null,
  }),
}));
EOFSTORE
echo "  [1/16] src/store/assessmentStore.ts"

# ─── 2. AppNavigator.tsx ───
backup_file "src/navigation/AppNavigator.ts"
cat > src/navigation/AppNavigator.tsx << 'EOFNAV'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { Step1ReceptorsScreen } from '../screens/Step1ReceptorsScreen';
import { Step2TumourScreen } from '../screens/Step2TumourScreen';
import { Step3MarkersScreen } from '../screens/Step3MarkersScreen';
import { P1Screen } from '../screens/P1Screen';
import { P2Screen } from '../screens/P2Screen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { FailClosedScreen } from '../screens/FailClosedScreen';
import { AboutScreen } from '../screens/AboutScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  P1: undefined;
  P2: undefined;
  Review: undefined;
  Result: undefined;
  FailClosed: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Step1" component={Step1ReceptorsScreen} />
      <Stack.Screen name="Step2" component={Step2TumourScreen} />
      <Stack.Screen name="Step3" component={Step3MarkersScreen} />
      <Stack.Screen name="P1" component={P1Screen} />
      <Stack.Screen name="P2" component={P2Screen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="FailClosed" component={FailClosedScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
EOFNAV
echo "  [2/16] src/navigation/AppNavigator.tsx"

# ─── 3. Step1ReceptorsScreen.tsx ───
backup_file "src/screens/Step1ReceptorsScreen.tsx"
cat > src/screens/Step1ReceptorsScreen.tsx << 'EOFSTEP1'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { useAssessmentStore } from '../store/assessmentStore';
import { generatePatientId } from '../utils/uuid';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const Step1ReceptorsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { form, setStep1, sessionId, setSessionId } = useAssessmentStore();

  React.useEffect(() => {
    if (!sessionId) setSessionId(generatePatientId());
  }, [sessionId, setSessionId]);

  const isValid = form.step1.ki67 !== '' && !isNaN(Number(form.step1.ki67));

  return (
    <ScreenLayout
      title="New assessment"
      subtitle="Step 1 of 5 · Receptor status"
      bannerText="Clinical transparency: outputs are decision support only, generated by a validated rule base. Clinical judgement remains with the clinician."
      steps={{ total: 5, current: 1 }}
      footer={
        <>
          <ACRButton title="Cancel" variant="secondary" onPress={() => navigation.navigate('Welcome')} />
          <ACRButton title="Next" variant="primary" disabled={!isValid} onPress={() => navigation.navigate('Step2')} />
        </>
      }
    >
      <ACRCard title="Receptor status">
        <Label text="ER status" required />
        <ACRSegmentedControl options={['positive', 'negative']} selected={form.step1.erStatus} onSelect={(v) => setStep1({ erStatus: v as 'positive' | 'negative' })} />
        <Label text="PR status" required />
        <ACRSegmentedControl options={['positive', 'negative']} selected={form.step1.prStatus} onSelect={(v) => setStep1({ prStatus: v as 'positive' | 'negative' })} />
        <Label text="HER2 status" required />
        <ACRSegmentedControl options={['positive', 'negative']} selected={form.step1.her2Status} onSelect={(v) => setStep1({ her2Status: v as 'positive' | 'negative' })} />
        <Label text="Ki-67 (%)" required />
        <ACRInput value={form.step1.ki67} onChangeText={(t) => setStep1({ ki67: t })} keyboardType="numeric" hint="0–100. Luminal A < 14, Luminal B ≥ 14. Guidance only — classification is performed by the reasoner." />
      </ACRCard>
      <ACRCard title="Session">
        <Label text="Session ID" generated />
        <ACRInput value={sessionId} readOnly hint="Fresh UUIDv4 per assessment. Never entered, never reused, never persisted." />
      </ACRCard>
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; required?: boolean; generated?: boolean }> = ({ text, required, generated }) => (
  <Text style={styles.label}>{text} {required ? <Text style={styles.small}>· required</Text> : null}{generated ? <Text style={styles.small}>· generated</Text> : null}</Text>
);

const styles = StyleSheet.create({
  label: { ...ACRTypography.label, marginTop: 9, marginBottom: 4 },
  small: { fontWeight: '400', color: ACRColors.muted },
});
EOFSTEP1
echo "  [3/16] src/screens/Step1ReceptorsScreen.tsx"

# ─── 4. Step2TumourScreen.tsx ───
backup_file "src/screens/Step2TumourScreen.tsx"
cat > src/screens/Step2TumourScreen.tsx << 'EOFSTEP2'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { useAssessmentStore } from '../store/assessmentStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const Step2TumourScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { form, setStep2 } = useAssessmentStore();

  return (
    <ScreenLayout
      title="New assessment"
      subtitle="Step 2 of 5 · Tumour characteristics"
      bannerText="Clinical transparency: outputs are decision support only, generated by a validated rule base."
      steps={{ total: 5, current: 2 }}
      footer={
        <>
          <ACRButton title="Back" variant="secondary" onPress={() => navigation.goBack()} />
          <ACRButton title="Next" variant="primary" onPress={() => navigation.navigate('Step3')} />
        </>
      }
    >
      <ACRCard title="Tumour">
        <Label text="Stage" optional />
        <View style={styles.pickerShell}><Text style={styles.pickerText}>{form.step2.stage || '—'}</Text></View>
        <Text style={styles.hint}>Values populated from the frozen API-contract enum — no overlapping aliases.</Text>
        <Label text="Grade" optional />
        <ACRSegmentedControl options={['1', '2', '3']} selected={form.step2.grade || ''} onSelect={(v) => setStep2({ grade: v as '1' | '2' | '3' })} />
        <Label text="Histological subtype" optional />
        <View style={styles.pickerShell}><Text style={styles.pickerText}>{form.step2.histologicalSubtype || '—'}</Text></View>
        <Label text="Nodal status" optional />
        <ACRSegmentedControl options={['N0', 'N1', 'N2', 'N3']} selected={form.step2.nodalStatus || ''} onSelect={(v) => setStep2({ nodalStatus: v as 'N0' | 'N1' | 'N2' | 'N3' })} />
        <Label text="Age (years)" optional />
        <ACRInput value={form.step2.age} onChangeText={(t) => setStep2({ age: t })} keyboardType="numeric" hint="18–120, whole years. Age is the only demographic field the reasoner consumes." />
      </ACRCard>
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; optional?: boolean }> = ({ text, optional }) => (
  <Text style={styles.label}>{text} {optional ? <Text style={styles.small}>· optional</Text> : null}</Text>
);

const styles = StyleSheet.create({
  label: { ...ACRTypography.label, marginTop: 9, marginBottom: 4 },
  small: { fontWeight: '400', color: ACRColors.muted },
  pickerShell: { width: '100%', paddingVertical: 8, paddingHorizontal: 9, borderWidth: 1.4, borderColor: ACRColors.line, borderRadius: 8, backgroundColor: '#fff' },
  pickerText: { fontSize: 13, color: ACRColors.ink },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 3 },
});
EOFSTEP2
echo "  [4/16] src/screens/Step2TumourScreen.tsx"

# ─── 5. Step3MarkersScreen.tsx ───
backup_file "src/screens/Step3MarkersScreen.tsx"
cat > src/screens/Step3MarkersScreen.tsx << 'EOFSTEP3'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { useAssessmentStore } from '../store/assessmentStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const Step3MarkersScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { form, setStep3 } = useAssessmentStore();

  return (
    <ScreenLayout
      title="New assessment"
      subtitle="Step 3 of 5 · Biomarkers and surgery"
      bannerText="Clinical transparency: outputs are decision support only, generated by a validated rule base."
      steps={{ total: 5, current: 3 }}
      footer={
        <>
          <ACRButton title="Back" variant="secondary" onPress={() => navigation.goBack()} />
          <ACRButton title="Next" variant="primary" onPress={() => navigation.navigate('P1')} />
        </>
      }
    >
      <ACRCard title="Serum markers">
        <Label text="CA 15-3 (U/mL)" optional />
        <ACRInput value={form.step3.ca153} onChangeText={(t) => setStep3({ ca153: t })} keyboardType="numeric" hint="Reference threshold 35.0 — evaluation is performed server-side." />
        <Label text="CEA (ng/mL)" optional />
        <ACRInput value={form.step3.cea} onChangeText={(t) => setStep3({ cea: t })} keyboardType="numeric" hint="Reference threshold 5.0 — evaluation is performed server-side." />
      </ACRCard>
      <ACRCard title="Surgery">
        <Label text="Surgery date" optional />
        <ACRInput value={form.step3.surgeryDate} onChangeText={(t) => setStep3({ surgeryDate: t })} hint="Future dates are permitted and submitted unchanged: the B3 guard is the reasoner's responsibility and must remain testable." />
      </ACRCard>
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; optional?: boolean }> = ({ text, optional }) => (
  <Text style={styles.label}>{text} {optional ? <Text style={styles.small}>· optional</Text> : null}</Text>
);

const styles = StyleSheet.create({
  label: { ...ACRTypography.label, marginTop: 9, marginBottom: 4 },
  small: { fontWeight: '400', color: ACRColors.muted },
});
EOFSTEP3
echo "  [5/16] src/screens/Step3MarkersScreen.tsx"

# ─── 6. P1Screen.tsx ───
backup_file "src/screens/P1Screen.tsx"
cat > src/screens/P1Screen.tsx << 'EOFP1'
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { useAssessmentStore } from '../store/assessmentStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const P1Screen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { form, setP1 } = useAssessmentStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const sizeVal = form.p1.tumorSize.trim();
    if (sizeVal !== '') {
      const num = Number(sizeVal);
      if (!Number.isFinite(num) || Number.isNaN(num) || num <= 0) {
        nextErrors.tumorSize = 'Enter a finite numeric value greater than zero.';
      }
    }
    if (!form.p1.gender) {
      nextErrors.gender = 'No accepted contract enum was available. No value has been assumed.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => { if (validate()) navigation.navigate('P2'); };
  const hasNodalConflict = !!form.step2.nodalStatus;

  return (
    <ScreenLayout
      title="New assessment"
      subtitle="Provisional extension P1 · Core inputs"
      bannerText="CLINICAL AND CONTRACT REVIEW PENDING — SYNTHETIC DATA ONLY"
      steps={{ total: 5, current: 4 }}
      footer={
        <>
          <ACRButton title="Back" variant="secondary" onPress={() => navigation.goBack()} />
          <ACRButton title="Next" variant="primary" onPress={handleNext} />
        </>
      }
    >
      <View style={styles.contractBox}>
        <Text style={styles.contractText}><Text style={styles.bold}>Contract note:</Text> values remain in memory and are not mapped to an API request in this update.</Text>
      </View>
      <ACRCard title="Core inputs requiring confirmation">
        <Label text="Tumour size" tag="unit pending" />
        <ACRInput value={form.p1.tumorSize} onChangeText={(t) => { setP1({ tumorSize: t }); if (errors.tumorSize) setErrors((e) => { const n = { ...e }; delete n.tumorSize; return n; }); }} keyboardType="numeric" hint="Finite number greater than zero. Unit and maximum must be confirmed before interface mapping." />
        {errors.tumorSize ? <Text style={styles.errorText}>{errors.tumorSize}</Text> : null}
        <Label text="Sex / gender used by reasoner" tag="contract enum" />
        <ACRSegmentedControl options={['female', 'male', 'other', 'unknown']} selected={form.p1.gender} onSelect={(v) => { setP1({ gender: v as any }); if (errors.gender) setErrors((e) => { const n = { ...e }; delete n.gender; return n; }); }} />
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
        <Text style={styles.hint}>No default. Display wording and wire value require confirmation.</Text>
      </ACRCard>
      {hasNodalConflict ? (
        <View style={styles.stopBox}>
          <Text style={styles.stopText}><Text style={styles.bold}>Contract blocker — not an input error:</Text> nodal status cannot be mapped while N0–N3 versus positive/negative semantics remain unresolved.</Text>
        </View>
      ) : null}
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; tag?: string }> = ({ text, tag }) => (
  <Text style={styles.label}>{text} {tag ? <Text style={styles.small}>· {tag}</Text> : null}</Text>
);

const styles = StyleSheet.create({
  label: { ...ACRTypography.label, marginTop: 9, marginBottom: 4 },
  small: { fontWeight: '400', color: ACRColors.muted },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 3 },
  errorText: { fontSize: 10, color: ACRColors.stopBorder, fontWeight: '700', marginTop: 4 },
  contractBox: { backgroundColor: '#fffaf0', borderWidth: 1, borderColor: '#e5bd62', borderRadius: 10, padding: 9, marginBottom: 10 },
  contractText: { fontSize: 9.5, color: '#6e4b10', lineHeight: 16 },
  stopBox: { backgroundColor: ACRColors.stopBg, borderWidth: 1, borderColor: ACRColors.stopBorder, borderRadius: 10, padding: 9, marginTop: 10 },
  stopText: { fontSize: 9.5, color: '#7a271a', lineHeight: 16 },
  bold: { fontWeight: '700' },
});
EOFP1
echo "  [6/16] src/screens/P1Screen.tsx"

# ─── 7. P2Screen.tsx ───
backup_file "src/screens/P2Screen.tsx"
cat > src/screens/P2Screen.tsx << 'EOFP2'
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { useAssessmentStore } from '../store/assessmentStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const P2Screen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { form, setP2 } = useAssessmentStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (form.p2.ecogScore !== '') {
      const eco = Number(form.p2.ecogScore);
      if (!Number.isInteger(eco) || eco < 0 || eco > 4) nextErrors.ecogScore = 'Enter a whole-number ECOG score from 0 to 4.';
    }
    if (form.p2.lvef !== '') {
      const lvef = Number(form.p2.lvef);
      if (!Number.isFinite(lvef) || Number.isNaN(lvef) || lvef < 0 || lvef > 100) nextErrors.lvef = 'Enter a finite percentage from 0 to 100.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReview = () => { if (validate()) navigation.navigate('Review'); };

  return (
    <ScreenLayout
      title="New assessment"
      subtitle="Provisional extension P2 · Decision modifiers"
      bannerText="RULE DEPENDENCIES REQUIRE CLINICAL AND EXECUTABLE REVIEW"
      steps={{ total: 5, current: 5 }}
      footer={
        <>
          <ACRButton title="Back" variant="secondary" onPress={() => navigation.goBack()} />
          <ACRButton title="Review" variant="primary" onPress={handleReview} />
        </>
      }
    >
      <ACRCard title="Performance and tumour biology">
        <Label text="ECOG performance status" tag="optional" />
        <ACRSegmentedControl options={['0', '1', '2', '3', '4']} selected={form.p2.ecogScore} onSelect={(v) => { setP2({ ecogScore: v }); if (errors.ecogScore) setErrors((e) => { const n = { ...e }; delete n.ecogScore; return n; }); }} />
        {errors.ecogScore ? <Text style={styles.errorText}>{errors.ecogScore}</Text> : null}
        <Label text="PD-L1 status" tag="optional" />
        <ACRSegmentedControl options={['positive', 'negative', 'not_tested']} selected={form.p2.pdl1Status} onSelect={(v) => setP2({ pdl1Status: v as any })} />
        <Label text="HER2-low" tag="optional" />
        <ACRSegmentedControl options={['positive', 'negative', 'unknown']} selected={form.p2.her2Low} onSelect={(v) => setP2({ her2Low: v as any })} />
      </ACRCard>
      <ACRCard title="Treatment safety and intent">
        <Label text="LVEF (%)" tag="optional" />
        <ACRInput value={form.p2.lvef} onChangeText={(t) => { setP2({ lvef: t }); if (errors.lvef) setErrors((e) => { const n = { ...e }; delete n.lvef; return n; }); }} keyboardType="numeric" hint="Finite percentage, 0–100 inclusive." />
        {errors.lvef ? <Text style={styles.errorText}>{errors.lvef}</Text> : null}
        <Label text="Treatment intent" tag="optional" />
        <ACRSegmentedControl options={['neoadjuvant', 'adjuvant', 'unspecified']} selected={form.p2.treatmentIntent} onSelect={(v) => setP2({ treatmentIntent: v as any })} />
      </ACRCard>
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; tag?: string }> = ({ text, tag }) => (
  <Text style={styles.label}>{text} {tag ? <Text style={styles.small}>· {tag}</Text> : null}</Text>
);

const styles = StyleSheet.create({
  label: { ...ACRTypography.label, marginTop: 9, marginBottom: 4 },
  small: { fontWeight: '400', color: ACRColors.muted },
  errorText: { fontSize: 10, color: ACRColors.stopBorder, fontWeight: '700', marginTop: 4 },
});
EOFP2
echo "  [7/16] src/screens/P2Screen.tsx"

# ─── 8. ReviewScreen.tsx ───
backup_file "src/screens/ReviewScreen.tsx"
cat > src/screens/ReviewScreen.tsx << 'EOFREV'
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const navigation = useNavigation<NavProp>();
  const { form, sessionId, attestation, setAttestation, setResult } = useAssessmentStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isVerified = attestation?.verificationState === 'VERIFIED';

  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try {
      const att = await checkAttestation();
      setAttestation(att);
      if (att.verificationState !== 'VERIFIED') { navigation.navigate('FailClosed'); setSubmitting(false); return; }
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
        client: { channel: 'MOBILE' as const, buildId: 'mob-v0.5.0+50', environment: 'EVALUATION' as const },
      };
      const response = await submitAssessment(request);
      setResult(response);
      navigation.navigate('Result');
    } catch (err: any) { setError(err.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <ScreenLayout title="Review" subtitle="Confirm entries before submission" bannerText="Clinical transparency: outputs are decision support only, generated by a validated rule base."
      footer={<><ACRButton title="Edit" variant="secondary" onPress={() => navigation.navigate('Step1')} /><ACRButton title="Submit" variant="primary" disabled={!isVerified || submitting} onPress={handleSubmit} /></>}>
      <ACRCard title="Entered values">
        <Row label="ER / PR / HER2" value={`${form.step1.erStatus.slice(0,3)} / ${form.step1.prStatus.slice(0,3)} / ${form.step1.her2Status.slice(0,3)}`} />
        <Row label="Ki-67" value={`${form.step1.ki67} %`} />
        <Row label="Stage / Grade" value={`${form.step2.stage || '—'} / ${form.step2.grade || '—'}`} />
        <Row label="Histology" value={form.step2.histologicalSubtype || '—'} />
        <Row label="Nodal status" value={form.step2.nodalStatus || '—'} />
        <Row label="Age" value={form.step2.age || '—'} />
        <Row label="CA 15-3 / CEA" value={`${form.step3.ca153 || '—'} / ${form.step3.cea || '—'}`} />
        <Row label="Surgery date" value={form.step3.surgeryDate || '—'} />
      </ACRCard>
      <ACRCard title="Provisional clinical-review fields — P1">
        <Row label="Tumour size" value={form.p1.tumorSize || '—'} />
        <Row label="Gender (reasoner)" value={form.p1.gender || '—'} />
        <Text style={styles.hint}>Not mapped to API. Contract confirmation pending.</Text>
      </ACRCard>
      <ACRCard title="Provisional clinical-review fields — P2">
        <Row label="ECOG" value={form.p2.ecogScore || '—'} />
        <Row label="PD-L1" value={form.p2.pdl1Status || '—'} />
        <Row label="HER2-low" value={form.p2.her2Low || '—'} />
        <Row label="LVEF" value={form.p2.lvef ? `${form.p2.lvef} %` : '—'} />
        <Row label="Treatment intent" value={form.p2.treatmentIntent || '—'} />
        <Text style={styles.hint}>Optional modifiers. Rule dependencies require clinical review.</Text>
      </ACRCard>
      <ACRCard title="Reasoning options">
        <Row label="Bayesian layer" value={form.step3.bayesianEnhanced ? 'ON' : 'OFF'} />
        <Text style={styles.hint}>Sets a request field only. No calculation occurs on the device.</Text>
      </ACRCard>
      <ACRCard title="Baseline">
        <Row label="Attestation" valueComponent={attestation ? <ACRStateBadge state={attestation.verificationState} /> : <Text style={styles.muted}>Checking…</Text>} />
        <Text style={styles.hint}>Reasoner v2.2.1 · OPENLLET_SWRL · ontology hash matches the accepted baseline manifest.</Text>
      </ACRCard>
      {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
    </ScreenLayout>
  );
};

const Row: React.FC<{ label: string; value?: string; valueComponent?: React.ReactNode }> = ({ label, value, valueComponent }) => (
  <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text>{valueComponent || <Text style={styles.rowValue}>{value}</Text>}</View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: ACRColors.line, borderStyle: 'dashed' },
  rowLabel: { fontSize: 11, color: ACRColors.ink },
  rowValue: { fontSize: 11, fontWeight: '600', color: ACRColors.ink },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 4 },
  muted: { fontSize: 11, color: ACRColors.muted },
  errorBox: { backgroundColor: ACRColors.stopBg, borderRadius: 8, padding: 10, marginTop: 10 },
  errorText: { color: ACRColors.stopBorder, fontSize: 11 },
});
EOFREV
echo "  [8/16] src/screens/ReviewScreen.tsx"

# ─── 9. src/locales/en-GB.json ───
backup_file "src/locales/en-GB.json"
cat > src/locales/en-GB.json << 'EOFenGB'
{
  "app": {
    "name": "ACR",
    "tagline": "Clinical Decision Support · Companion",
    "trialBanner": "INVESTIGATIONAL — INVITED EVALUATION ONLY"
  },
  "common": {
    "cancel": "Cancel",
    "back": "Back",
    "next": "Next",
    "review": "Review",
    "submit": "Submit",
    "edit": "Edit",
    "done": "Done",
    "close": "Close",
    "about": "About",
    "retry": "Retry check",
    "retryCheck": "Retry check",
    "newAssessment": "New assessment",
    "required": "required",
    "optional": "optional",
    "generated": "generated",
    "positive": "positive",
    "negative": "negative",
    "on": "ON",
    "off": "OFF",
    "emDash": "—",
    "checking": "Checking…",
    "verified": "VERIFIED",
    "unavailable": "UNAVAILABLE",
    "mismatch": "MISMATCH",
    "yes": "Yes",
    "no": "No"
  },
  "welcome": {
    "title": "Before you begin",
    "description1": "This app is a presentation client for the ACR-Platform reasoner. All reasoning happens server-side.",
    "description2": "Synthetic data only. Do not enter live, coded or pseudonymised patient information.",
    "description3": "No intentional clinical data at rest. Entries exist in memory for one assessment only.",
    "description4": "Not for diagnosis or treatment.",
    "beginButton": "I understand — Begin",
    "languageSelector": "Language"
  },
  "assessment": {
    "newTitle": "New assessment",
    "step1Subtitle": "Step 1 of 5 · Receptor status",
    "step2Subtitle": "Step 2 of 5 · Tumour characteristics",
    "step3Subtitle": "Step 3 of 5 · Biomarkers and surgery",
    "p1Subtitle": "Step 4 of 5 · Provisional extension P1",
    "p2Subtitle": "Step 5 of 5 · Provisional extension P2",
    "stepSubtitle": "Step {{current}} of {{total}} · {{title}}",
    "reviewTitle": "Review",
    "reviewSubtitle": "Confirm entries before submission",
    "clinicalTransparency": "Clinical transparency: outputs are decision support only, generated by a validated rule base. Clinical judgement remains with the clinician.",
    "clinicalTransparencyBanner": "Clinical transparency: outputs are decision support only, generated by a validated rule base. Clinical judgement remains with the clinician."
  },
  "receptors": {
    "cardTitle": "Receptor status",
    "stepTitle": "Receptor status",
    "erStatus": "ER status",
    "prStatus": "PR status",
    "her2Status": "HER2 status",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100. Luminal A < 14, Luminal B ≥ 14. Guidance only — classification is performed by the reasoner.",
    "positive": "positive",
    "negative": "negative",
    "sessionId": "Session ID",
    "sessionIdHint": "Fresh UUIDv4 per assessment. Never entered, never reused, never persisted.",
    "sessionLabel": "Session"
  },
  "tumour": {
    "cardTitle": "Tumour",
    "stepTitle": "Tumour characteristics",
    "stage": "Stage",
    "stageHint": "Values populated from the frozen API-contract enum — no overlapping aliases.",
    "grade": "Grade",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "Histological subtype",
    "histologyIDC": "IDC — invasive ductal carcinoma",
    "histologyILC": "ILC — invasive lobular carcinoma",
    "histologyDCIS": "DCIS — ductal carcinoma in situ",
    "histologyPaget": "Paget's disease",
    "nodalStatus": "Nodal status",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "Age (years)",
    "ageHint": "18–120, whole years. Age is the only demographic field the reasoner consumes."
  },
  "biomarkers": {
    "cardTitle": "Serum markers",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "Reference threshold 35.0 — evaluation is performed server-side.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "Reference threshold 5.0 — evaluation is performed server-side.",
    "surgeryDate": "Surgery date",
    "surgeryDateHint": "Future dates are permitted and submitted unchanged: the B3 guard is the reasoner's responsibility and must remain testable.",
    "surgeryCardTitle": "Surgery"
  },
  "markers": {
    "stepTitle": "Biomarkers and surgery",
    "serumMarkersTitle": "Serum markers",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "Reference threshold 35.0 — evaluation is performed server-side.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "Reference threshold 5.0 — evaluation is performed server-side.",
    "surgeryTitle": "Surgery",
    "surgeryDate": "Surgery date",
    "surgeryDateHint": "Future dates are permitted and submitted unchanged: the B3 guard is the reasoner's responsibility and must remain testable."
  },
  "session": {
    "cardTitle": "Session",
    "sessionId": "Session ID",
    "sessionIdHint": "Fresh UUIDv4 per assessment. Never entered, never reused, never persisted."
  },
  "p1": {
    "stepTitle": "Provisional extension P1 · Core inputs",
    "cardTitle": "Core inputs requiring confirmation",
    "tumorSize": "Tumour size",
    "tumorSizeHint": "Finite number greater than zero. Unit and maximum must be confirmed before interface mapping.",
    "tumorSizeError": "Enter a finite numeric value greater than zero.",
    "gender": "Sex / gender used by reasoner",
    "genderHint": "No default. Display wording and wire value require confirmation.",
    "genderError": "No accepted contract enum was available. No value has been assumed.",
    "nodalWarning": "Nodal mapping pending: current UI N0–N3 is not silently converted to positive/negative.",
    "contractNote": "Contract note: values remain in memory and are not mapped to an API request in this update.",
    "blockerTitle": "Contract blocker — not an input error",
    "blockerText": "nodal status cannot be mapped while N0–N3 versus positive/negative semantics remain unresolved."
  },
  "p2": {
    "stepTitle": "Provisional extension P2 · Decision modifiers",
    "performanceTitle": "Performance and tumour biology",
    "ecog": "ECOG performance status",
    "ecogError": "Enter a whole-number ECOG score from 0 to 4.",
    "pdl1": "PD-L1 status",
    "her2Low": "HER2-low",
    "safetyTitle": "Treatment safety and intent",
    "lvef": "LVEF (%)",
    "lvefHint": "Finite percentage, 0–100 inclusive.",
    "lvefError": "Enter a finite percentage from 0 to 100.",
    "treatmentIntent": "Treatment intent",
    "optionalHint": "An empty optional value is accepted and remains null.",
    "ruleWarning": "RULE DEPENDENCIES REQUIRE CLINICAL AND EXECUTABLE REVIEW"
  },
  "review": {
    "title": "Review",
    "subtitle": "Confirm entries before submission",
    "enteredValues": "Entered values",
    "erPrHer2": "ER / PR / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "Stage / Grade",
    "histology": "Histology",
    "nodalStatusLabel": "Nodal status",
    "nodalStatus": "Nodal status",
    "ageLabel": "Age",
    "age": "Age",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "Surgery date",
    "surgeryDate": "Surgery date",
    "reasoningOptions": "Reasoning options",
    "bayesianLayer": "Bayesian layer",
    "bayesianHint": "Sets a request field only. No calculation occurs on the device.",
    "baseline": "Baseline",
    "attestation": "Attestation",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · ontology hash matches the accepted baseline manifest.",
    "checking": "Checking…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · ontology hash matches the accepted baseline manifest.",
    "submitBlocked": "Submission is blocked unless attestation is VERIFIED.",
    "submissionFailed": "Submission failed",
    "provisionalP1": "Provisional clinical-review fields — P1",
    "provisionalP2": "Provisional clinical-review fields — P2",
    "tumorSize": "Tumour size",
    "genderReasoner": "Gender (reasoner)",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "Treatment intent",
    "p1NotMapped": "Not mapped to API. Contract confirmation pending.",
    "p2RuleWarning": "Optional modifiers. Rule dependencies require clinical review."
  },
  "result": {
    "title": "Assessment result",
    "subtitle": "Server-side reasoning · synthetic profile",
    "noResult": "No result available.",
    "newAssessment": "New assessment",
    "molecularSubtype": "Molecular subtype",
    "bayesianConfidence": "Bayesian confidence",
    "confidenceHint": "Moderate confidence. Full precision shown as a visible integrity check.",
    "bayesianHint": "Moderate confidence. Full precision shown as a visible integrity check.",
    "rulesFired": "Rules fired",
    "rulesFiredHint": "Only rules that actually fired are listed.",
    "recommendations": "Recommendations",
    "recommendationsHint": "Text is returned by the reasoner and rendered unchanged.",
    "provenance": "Reasoning provenance",
    "reasoningProvenance": "Reasoning provenance",
    "retention": "Retention",
    "retentionHint": "This result is held in memory only. Leaving this screen clears the assessment. Nothing is written to device storage.",
    "followUp": "Follow-up",
    "biomarker": "Biomarker",
    "reasoningMode": "Reasoning mode",
    "reasonerVersion": "Reasoner",
    "responseContract": "Response contract",
    "timestamp": "Timestamp",
    "buildId": "Build ID",
    "ontologySHA256": "Ontology SHA-256",
    "tapToExpand": "tap to expand"
  },
  "failClosed": {
    "title": "Service unavailable",
    "subtitle": "Baseline verification failed",
    "heading": "Assessment blocked",
    "blockedTitle": "Assessment blocked",
    "message": "The service could not verify that the connected reasoner matches the accepted baseline. No assessment can be submitted until verification succeeds.",
    "blockedMessage": "The service could not verify that the connected reasoner matches the accepted baseline. No assessment can be submitted until verification succeeds.",
    "verificationDetail": "Verification detail",
    "expectedReasoner": "Expected reasoner",
    "observedReasoner": "Observed reasoner",
    "ontologyHash": "Ontology hash",
    "notObserved": "not observed",
    "observed": "observed",
    "lastSuccessfulCheck": "Last successful check",
    "expectedValuesHint": "Expected values come from the accepted baseline manifest; they are never reported as observations.",
    "verificationHint": "Expected values come from the accepted baseline manifest; they are never reported as observations.",
    "sameTreatment": "Same treatment for MISMATCH. Retry re-runs verification only — it never resubmits an assessment.",
    "retryCheck": "Retry check",
    "state": "State"
  },
  "about": {
    "title": "About",
    "subtitle": "Build and baseline identity",
    "environment": "ENVIRONMENT: EVALUATION",
    "appSection": "Application",
    "application": "Application",
    "marketingVersion": "Marketing version",
    "nativeBuild": "Native build",
    "easBuild": "EAS build / profile",
    "easBuildProfile": "EAS build / profile",
    "serviceSection": "Service",
    "service": "Service",
    "gateway": "Gateway",
    "reasoner": "Reasoner",
    "responseContractLabel": "Response contract",
    "responseContract": "Response contract",
    "reasoningModeLabel": "Reasoning mode",
    "reasoningMode": "Reasoning mode",
    "attestationSection": "Baseline attestation",
    "baselineAttestation": "Baseline attestation",
    "state": "State",
    "lastVerified": "Last verified",
    "ontologyHashLabel": "Ontology SHA-256 (observed, read-only mount)",
    "ontologySha256": "Ontology SHA-256 (observed, read-only mount):",
    "dataHandlingSection": "Data handling",
    "dataHandling": "Data handling",
    "dataHandlingText": "No intentional clinical data at rest. No analytics. Crash reporting disabled for wave one. Over-the-air updates disabled — every change requires a new reviewed build.",
    "unknownValue": "UNAVAILABLE"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "Rule authored and promoted within the ACR rule base",
    "openlletDesc": "Rule evaluated and verified by the Openllet reasoner"
  },
  "errors": {
    "schemaInvalid": "Invalid input format. Please check your entries.",
    "authRequired": "Session expired. Please restart the app and redeem your invite code.",
    "attestationMismatch": "The connected reasoner does not match the accepted baseline. Assessment blocked.",
    "attestationUnavailable": "The reasoner baseline could not be verified. Please retry.",
    "serviceUnavailable": "Service temporarily unavailable. Please try again later.",
    "indeterminate": "The assessment outcome is uncertain. Do not retry automatically — contact support.",
    "rateLimited": "Too many requests. Please wait before trying again.",
    "networkError": "Network connection failed. Please check your connection and try again."
  }
}
EOFenGB
echo "  [9/16] src/locales/en-GB.json"

# ─── 10. src/locales/fr-FR.json ───
backup_file "src/locales/fr-FR.json"
cat > src/locales/fr-FR.json << 'EOFfrFR'
{
  "app": {
    "name": "ACR",
    "tagline": "Support décisionnel clinique · Companion",
    "trialBanner": "EN INVESTIGATION — ÉVALUATION SUR INVITATION UNIQUEMENT"
  },
  "common": {
    "cancel": "Annuler",
    "back": "Retour",
    "next": "Suivant",
    "review": "Réviser",
    "submit": "Soumettre",
    "edit": "Modifier",
    "done": "Terminé",
    "close": "Fermer",
    "about": "À propos",
    "retry": "Réessayer",
    "newAssessment": "Nouvelle évaluation",
    "required": "obligatoire",
    "optional": "facultatif",
    "generated": "généré",
    "on": "ACTIF",
    "off": "INACTIF",
    "verified": "VÉRIFIÉ",
    "unavailable": "NON DISPONIBLE",
    "mismatch": "NON CONCORDANT",
    "yes": "Oui",
    "no": "Non",
    "checking": "Vérification en cours…",
    "emDash": "—",
    "negative": "négatif",
    "positive": "positif",
    "retryCheck": "Réessayer"
  },
  "welcome": {
    "title": "Avant de commencer",
    "description1": "Cette application est un client de présentation pour le moteur d'inférence ACR-Platform. Tout le raisonnement s'effectue côté serveur.",
    "description2": "Données synthétiques uniquement. N'entrez pas d'informations patient réelles, codées ou pseudonymisées.",
    "description3": "Aucune donnée clinique intentionnelle au repos. Les entrées existent en mémoire pour une seule évaluation.",
    "description4": "Pas pour le diagnostic ou le traitement.",
    "beginButton": "J'ai compris — Commencer",
    "languageSelector": "Langue"
  },
  "assessment": {
    "newTitle": "Nouvelle évaluation",
    "step1Subtitle": "Étape 1 sur 5 · Statut des récepteurs",
    "step2Subtitle": "Étape 2 sur 5 · Caractéristiques de la tumeur",
    "step3Subtitle": "Étape 3 sur 5 · Biomarqueurs et chirurgie",
    "p1Subtitle": "Étape 4 sur 5 · Extension provisoire P1",
    "p2Subtitle": "Étape 5 sur 5 · Extension provisoire P2",
    "stepSubtitle": "Étape {{current}} sur {{total}} · {{title}}",
    "reviewTitle": "Révision",
    "reviewSubtitle": "Confirmez les entrées avant soumission",
    "clinicalTransparency": "Klinische Transparenz: Die Ergebnisse sind ausschließlich Entscheidungshilfen, generiert durch eine validierte Regelbasis. Die klinische Beurteilung verbleibt beim Kliniker.",
    "clinicalTransparencyBanner": "Klinische Transparenz: Die Ergebnisse sind ausschließlich Entscheidungshilfen, generiert durch eine validierte Regelbasis. Die klinische Beurteilung verbleibt beim Kliniker."
  },
  "receptors": {
    "cardTitle": "Statut des récepteurs",
    "stepTitle": "Statut des récepteurs",
    "erStatus": "Statut ER",
    "prStatus": "Statut PR",
    "her2Status": "Statut HER2",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100. Luminal A < 14, Luminal B ≥ 14. Uniquement à titre indicatif — la classification est effectuée par le moteur d'inférence.",
    "positive": "positif",
    "negative": "négatif",
    "sessionId": "ID de session",
    "sessionIdHint": "Nouvel UUIDv4 par évaluation. Jamais saisi, jamais réutilisé, jamais persisté.",
    "sessionLabel": "Session"
  },
  "tumour": {
    "cardTitle": "Tumeur",
    "stepTitle": "Caractéristiques de la tumeur",
    "stage": "Stade",
    "stageHint": "Valeurs issues de l'énumération figée du contrat API — aucun alias chevauchant.",
    "grade": "Grade",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "Sous-type histologique",
    "histologyIDC": "IDC — carcinome canalaire infiltrant",
    "histologyILC": "ILC — carcinome lobulaire infiltrant",
    "histologyDCIS": "DCIS — carcinome canalaire in situ",
    "histologyPaget": "Maladie de Paget",
    "nodalStatus": "Statut nodal",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "Âge (ans)",
    "ageHint": "18–120, années entières. L'âge est le seul champ démographique consommé par le moteur d'inférence."
  },
  "biomarkers": {
    "cardTitle": "Marqueurs sériques",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "Seuil de référence 35,0 — l'évaluation est effectuée côté serveur.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "Seuil de référence 5,0 — l'évaluation est effectuée côté serveur.",
    "surgeryDate": "Date de chirurgie",
    "surgeryDateHint": "Les dates futures sont autorisées et soumises inchangées : le garde B3 est la responsabilité du moteur d'inférence et doit rester testable.",
    "surgeryCardTitle": "Chirurgie"
  },
  "markers": {
    "stepTitle": "Biomarqueurs et chirurgie",
    "serumMarkersTitle": "Marqueurs sériques",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "Seuil de référence 35,0 — l'évaluation est effectuée côté serveur.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "Seuil de référence 5,0 — l'évaluation est effectuée côté serveur.",
    "surgeryTitle": "Chirurgie",
    "surgeryDate": "Date de chirurgie",
    "surgeryDateHint": "Les dates futures sont autorisées et soumises inchangées : le garde B3 est la responsabilité du moteur d'inférence et doit rester testable."
  },
  "session": {
    "cardTitle": "Session",
    "sessionId": "ID de session",
    "sessionIdHint": "Nouvel UUIDv4 par évaluation. Jamais saisi, jamais réutilisé, jamais persisté."
  },
  "p1": {
    "stepTitle": "Extension provisoire P1 · Entrées principales",
    "cardTitle": "Entrées principales nécessitant confirmation",
    "tumorSize": "Taille de la tumeur",
    "tumorSizeHint": "Nombre fini supérieur à zéro. L'unité et le maximum doivent être confirmés avant le mappage d'interface.",
    "tumorSizeError": "Saisissez une valeur numérique finie supérieure à zéro.",
    "gender": "Sexe / genre utilisé par le reasoner",
    "genderHint": "Aucune valeur par défaut. Le libellé d'affichage et la valeur wire nécessitent une confirmation.",
    "genderError": "Aucun enum contractuel accepté n'était disponible. Aucune valeur n'a été assumée.",
    "nodalWarning": "Mappage nodal en attente : l'interface N0–N3 n'est pas silencieusement convertie en positif/négatif.",
    "contractNote": "Note contractuelle : les valeurs restent en mémoire et ne sont pas mappées à une requête API dans cette mise à jour.",
    "blockerTitle": "Bloqueur contractuel — pas une erreur de saisie",
    "blockerText": "le statut nodal ne peut pas être mappé tant que la sémantique N0–N3 vs positif/négatif reste non résolue."
  },
  "p2": {
    "stepTitle": "Extension provisoire P2 · Modificateurs de décision",
    "performanceTitle": "Performance et biologie tumorale",
    "ecog": "Statut de performance ECOG",
    "ecogError": "Saisissez un score ECOG entier de 0 à 4.",
    "pdl1": "Statut PD-L1",
    "her2Low": "HER2-low",
    "safetyTitle": "Sécurité du traitement et intention",
    "lvef": "LVEF (%)",
    "lvefHint": "Pourcentage fini, 0–100 inclus.",
    "lvefError": "Saisissez un pourcentage fini de 0 à 100.",
    "treatmentIntent": "Intention de traitement",
    "optionalHint": "Une valeur optionnelle vide est acceptée et reste nulle.",
    "ruleWarning": "LES DÉPENDANCES DE RÈGLES NÉCESSITENT UN EXAMEN CLINIQUE ET EXÉCUTABLE"
  },
  "review": {
    "title": "Révision",
    "subtitle": "Confirmez les entrées avant soumission",
    "enteredValues": "Valeurs saisies",
    "erPrHer2": "ER / PR / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "Stade / Grade",
    "histology": "Histologie",
    "nodalStatusLabel": "Statut nodal",
    "nodalStatus": "Statut nodal",
    "ageLabel": "Âge",
    "age": "Âge",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "Date de chirurgie",
    "surgeryDate": "Date de chirurgie",
    "reasoningOptions": "Options de raisonnement",
    "bayesianLayer": "Couche bayésienne",
    "bayesianHint": "Définit uniquement un champ de requête. Aucun calcul sur l'appareil.",
    "baseline": "Ligne de base",
    "attestation": "Attestation",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · le hachage de l'ontologie correspond au manifeste de ligne de base accepté.",
    "checking": "Vérification en cours…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · le hachage de l'ontologie correspond au manifeste de ligne de base accepté.",
    "submitBlocked": "La soumission est bloquée tant que l'attestation n'est pas VÉRIFIÉE.",
    "submissionFailed": "Échec de la soumission",
    "provisionalP1": "Champs d'examen clinique provisoires — P1",
    "provisionalP2": "Champs d'examen clinique provisoires — P2",
    "tumorSize": "Taille de la tumeur",
    "genderReasoner": "Genre (reasoner)",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "Intention de traitement",
    "p1NotMapped": "Non mappé à l'API. Confirmation contractuelle en attente.",
    "p2RuleWarning": "Modificateurs optionnels. Les dépendances de règles nécessitent un examen clinique."
  },
  "result": {
    "title": "Résultat de l'évaluation",
    "subtitle": "Raisonnement côté serveur · profil synthétique",
    "noResult": "Aucun résultat disponible.",
    "newAssessment": "Nouvelle évaluation",
    "molecularSubtype": "Sous-type moléculaire",
    "bayesianConfidence": "Confiance bayésienne",
    "confidenceHint": "Confiance modérée. La pleine précision est affichée comme une vérification d'intégrité visible.",
    "bayesianHint": "Confiance modérée. La pleine précision est affichée comme une vérification d'intégrité visible.",
    "rulesFired": "Règles déclenchées",
    "rulesFiredHint": "Seules les règles effectivement déclenchées sont listées.",
    "recommendations": "Recommandations",
    "recommendationsHint": "Le texte est retourné par le moteur d'inférence et rendu inchangé.",
    "provenance": "Provenance du raisonnement",
    "reasoningProvenance": "Provenance du raisonnement",
    "retention": "Rétention",
    "retentionHint": "Ce résultat est conservé uniquement en mémoire. Quitter cet écran efface l'évaluation. Rien n'est écrit sur le stockage de l'appareil.",
    "followUp": "Suivi",
    "biomarker": "Biomarqueur",
    "reasoningMode": "Mode de raisonnement",
    "reasonerVersion": "Moteur d'inférence",
    "responseContract": "Contrat de réponse",
    "timestamp": "Horodatage",
    "buildId": "ID de build",
    "ontologySHA256": "SHA-256 de l'ontologie",
    "tapToExpand": "appuyer pour développer"
  },
  "failClosed": {
    "title": "Service indisponible",
    "subtitle": "Échec de la vérification de la ligne de base",
    "heading": "Évaluation bloquée",
    "blockedTitle": "Évaluation bloquée",
    "message": "Le service n'a pas pu vérifier que le moteur d'inférence connecté correspond à la ligne de base acceptée. Aucune évaluation ne peut être soumise tant que la vérification ne réussit pas.",
    "blockedMessage": "Le service n'a pas pu vérifier que le moteur d'inférence connecté correspond à la ligne de base acceptée. Aucune évaluation ne peut être soumise tant que la vérification ne réussit pas.",
    "verificationDetail": "Détail de vérification",
    "expectedReasoner": "Moteur d'inférence attendu",
    "observedReasoner": "Moteur d'inférence observé",
    "ontologyHash": "Hachage de l'ontologie",
    "notObserved": "non observé",
    "observed": "observé",
    "lastSuccessfulCheck": "Dernière vérification réussie",
    "expectedValuesHint": "Les valeurs attendues proviennent du manifeste de ligne de base accepté ; elles ne sont jamais rapportées comme observations.",
    "verificationHint": "Les valeurs attendues proviennent du manifeste de ligne de base accepté ; elles ne sont jamais rapportées comme observations.",
    "sameTreatment": "Même traitement pour NON CONCORDANT. Réessayer relance uniquement la vérification — il ne resoumet jamais une évaluation.",
    "retryCheck": "Réessayer",
    "state": "État"
  },
  "about": {
    "title": "À propos",
    "subtitle": "Identité du build et de la ligne de base",
    "environment": "ENVIRONNEMENT : ÉVALUATION",
    "appSection": "Application",
    "application": "Application",
    "marketingVersion": "Version marketing",
    "nativeBuild": "Build natif",
    "easBuild": "Build EAS / profil",
    "easBuildProfile": "Build EAS / profil",
    "serviceSection": "Service",
    "service": "Service",
    "gateway": "Passerelle",
    "reasoner": "Moteur d'inférence",
    "responseContractLabel": "Contrat de réponse",
    "responseContract": "Contrat de réponse",
    "reasoningModeLabel": "Mode de raisonnement",
    "reasoningMode": "Mode de raisonnement",
    "attestationSection": "Attestation de ligne de base",
    "baselineAttestation": "Attestation de ligne de base",
    "state": "État",
    "lastVerified": "Dernière vérification",
    "ontologyHashLabel": "SHA-256 de l'ontologie (observé, montage en lecture seule)",
    "ontologySha256": "SHA-256 de l'ontologie (observé, montage en lecture seule) :",
    "dataHandlingSection": "Gestion des données",
    "dataHandling": "Gestion des données",
    "dataHandlingText": "Aucune donnée clinique intentionnelle au repos. Pas d'analytique. Rapports de crash désactivés pour la première vague. Mises à jour OTA désactivées — chaque modification nécessite un nouveau build révisé.",
    "unknownValue": "NON DISPONIBLE"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "Règle créée et promue au sein de la base de règles ACR",
    "openlletDesc": "Règle évaluée et vérifiée par le moteur d'inférence Openllet"
  },
  "errors": {
    "schemaInvalid": "Format d'entrée invalide. Veuillez vérifier vos saisies.",
    "authRequired": "Session expirée. Veuillez redémarrer l'application et utiliser votre code d'invitation.",
    "attestationMismatch": "Le moteur d'inférence connecté ne correspond pas à la ligne de base acceptée. Évaluation bloquée.",
    "attestationUnavailable": "La ligne de base du moteur d'inférence n'a pas pu être vérifiée. Veuillez réessayer.",
    "serviceUnavailable": "Service temporairement indisponible. Veuillez réessayer plus tard.",
    "indeterminate": "Le résultat de l'évaluation est incertain. Ne réessayez pas automatiquement — contactez le support.",
    "rateLimited": "Trop de requêtes. Veuillez attendre avant de réessayer.",
    "networkError": "Échec de la connexion réseau. Veuillez vérifier votre connexion et réessayer."
  }
}
EOFfrFR
echo "  [10/16] src/locales/fr-FR.json"

# ─── 11. src/locales/de-DE.json ───
backup_file "src/locales/de-DE.json"
cat > src/locales/de-DE.json << 'EOFdeDE'
{
  "app": {
    "name": "ACR",
    "tagline": "Klinische Entscheidungshilfe · Companion",
    "trialBanner": "INVESTIGATIONAL — NUR EINLADUNGSEVALUIERUNG"
  },
  "common": {
    "cancel": "Abbrechen",
    "back": "Zurück",
    "next": "Weiter",
    "review": "Überprüfen",
    "submit": "Senden",
    "edit": "Bearbeiten",
    "done": "Fertig",
    "close": "Schließen",
    "about": "Info",
    "retry": "Erneut versuchen",
    "newAssessment": "Neue Bewertung",
    "required": "erforderlich",
    "optional": "optional",
    "generated": "generiert",
    "on": "EIN",
    "off": "AUS",
    "verified": "VERIFIZIERT",
    "unavailable": "NICHT VERFÜGBAR",
    "mismatch": "NICHT ÜBEREINSTIMMEND",
    "yes": "Ja",
    "no": "Nein",
    "checking": "Prüfung läuft…",
    "emDash": "—",
    "negative": "negativ",
    "positive": "positiv",
    "retryCheck": "Erneut versuchen"
  },
  "welcome": {
    "title": "Bevor Sie beginnen",
    "description1": "Diese App ist ein Präsentationsclient für den ACR-Platform Reasoner. Alle Reasoning-Prozesse erfolgen serverseitig.",
    "description2": "Nur synthetische Daten. Bitte geben Sie keine echten, kodierten oder pseudonymisierten Patientendaten ein.",
    "description3": "Keine beabsichtigte Speicherung klinischer Daten. Eingaben existieren nur im Speicher für eine einzelne Bewertung.",
    "description4": "Nicht für Diagnose oder Behandlung.",
    "beginButton": "Ich verstehe — Beginnen",
    "languageSelector": "Sprache"
  },
  "assessment": {
    "newTitle": "Neue Bewertung",
    "step1Subtitle": "Schritt 1 von 5 · Rezeptorstatus",
    "step2Subtitle": "Schritt 2 von 5 · Tumorcharakteristiken",
    "step3Subtitle": "Schritt 3 von 5 · Biomarker und Chirurgie",
    "p1Subtitle": "Schritt 4 von 5 · Provisorische Erweiterung P1",
    "p2Subtitle": "Schritt 5 von 5 · Provisorische Erweiterung P2",
    "stepSubtitle": "Schritt {{current}} von {{total}} · {{title}}",
    "reviewTitle": "Überprüfung",
    "reviewSubtitle": "Bestätigen Sie die Eingaben vor dem Senden",
    "clinicalTransparency": "Klinische Transparenz: Die Ergebnisse sind ausschließlich Entscheidungshilfen, generiert durch eine validierte Regelbasis. Die klinische Beurteilung verbleibt beim Kliniker.",
    "clinicalTransparencyBanner": "Klinische Transparenz: Die Ergebnisse sind ausschließlich Entscheidungshilfen, generiert durch eine validierte Regelbasis. Die klinische Beurteilung verbleibt beim Kliniker."
  },
  "receptors": {
    "cardTitle": "Rezeptorstatus",
    "stepTitle": "Rezeptorstatus",
    "erStatus": "ER-Status",
    "prStatus": "PR-Status",
    "her2Status": "HER2-Status",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100. Luminal A < 14, Luminal B ≥ 14. Nur als Orientierung — die Klassifikation erfolgt durch den Reasoner.",
    "positive": "positiv",
    "negative": "negativ",
    "sessionId": "Sitzungs-ID",
    "sessionIdHint": "Neue UUIDv4 pro Bewertung. Nie eingegeben, nie wiederverwendet, nie persistiert.",
    "sessionLabel": "Sitzung"
  },
  "tumour": {
    "cardTitle": "Tumor",
    "stepTitle": "Tumorcharakteristiken",
    "stage": "Stadium",
    "stageHint": "Werte aus dem festgelegten API-Vertrags-Enum — keine überlappenden Aliase.",
    "grade": "Grad",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "Histologischer Subtyp",
    "histologyIDC": "IDC — invasives duktales Karzinom",
    "histologyILC": "ILC — invasives lobuläres Karzinom",
    "histologyDCIS": "DCIS — duktales Karzinom in situ",
    "histologyPaget": "Morbus Paget",
    "nodalStatus": "Lymphknotenstatus",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "Alter (Jahre)",
    "ageHint": "18–120, ganze Jahre. Das Alter ist das einzige demografische Feld, das der Reasoner verarbeitet."
  },
  "biomarkers": {
    "cardTitle": "Serummarker",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "Referenzschwelle 35,0 — Auswertung erfolgt serverseitig.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "Referenzschwelle 5,0 — Auswertung erfolgt serverseitig.",
    "surgeryDate": "Chirurgiedatum",
    "surgeryDateHint": "Zukünftige Daten sind erlaubt und werden unverändert übermittelt: Die B3-Überwachung ist Aufgabe des Reasoners und muss testbar bleiben.",
    "surgeryCardTitle": "Chirurgie"
  },
  "markers": {
    "stepTitle": "Biomarker und Chirurgie",
    "serumMarkersTitle": "Serummarker",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "Referenzschwelle 35,0 — Auswertung erfolgt serverseitig.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "Referenzschwelle 5,0 — Auswertung erfolgt serverseitig.",
    "surgeryTitle": "Chirurgie",
    "surgeryDate": "Chirurgiedatum",
    "surgeryDateHint": "Zukünftige Daten sind erlaubt und werden unverändert übermittelt: Die B3-Überwachung ist Aufgabe des Reasoners und muss testbar bleiben."
  },
  "session": {
    "cardTitle": "Sitzung",
    "sessionId": "Sitzungs-ID",
    "sessionIdHint": "Neue UUIDv4 pro Bewertung. Nie eingegeben, nie wiederverwendet, nie persistiert."
  },
  "p1": {
    "stepTitle": "Provisorische Erweiterung P1 · Kerneingaben",
    "cardTitle": "Kerninputs erfordern Bestätigung",
    "tumorSize": "Tumorgröße",
    "tumorSizeHint": "Endliche Zahl größer als Null. Einheit und Maximum müssen vor dem Schnittstellen-Mapping bestätigt werden.",
    "tumorSizeError": "Geben Sie einen endlichen numerischen Wert größer als Null ein.",
    "gender": "Geschlecht / vom Reasoner verwendetes Geschlecht",
    "genderHint": "Kein Standardwert. Anzeigewort und Wire-Wert erfordern Bestätigung.",
    "genderError": "Kein akzeptiertes Vertrags-Enum verfügbar. Es wurde kein Wert angenommen.",
    "nodalWarning": "Nodales Mapping ausstehend: aktuelles UI N0–N3 wird nicht stillschweigend in positiv/negativ umgewandelt.",
    "contractNote": "Vertragsnotiz: Werte verbleiben im Speicher und werden in diesem Update nicht auf eine API-Anfrage abgebildet.",
    "blockerTitle": "Vertragsblocker — kein Eingabefehler",
    "blockerText": "Nodalstatus kann nicht abgebildet werden, solange die Semantik von N0–N3 vs. positiv/negativ ungelöst bleibt."
  },
  "p2": {
    "stepTitle": "Provisorische Erweiterung P2 · Entscheidungsmodifikatoren",
    "performanceTitle": "Leistung und Tumorbiologie",
    "ecog": "ECOG-Leistungsstatus",
    "ecogError": "Geben Sie einen ganzzahligen ECOG-Score von 0 bis 4 ein.",
    "pdl1": "PD-L1-Status",
    "her2Low": "HER2-low",
    "safetyTitle": "Behandlungssicherheit und -absicht",
    "lvef": "LVEF (%)",
    "lvefHint": "Endlicher Prozentsatz, 0–100 inklusive.",
    "lvefError": "Geben Sie einen endlichen Prozentsatz von 0 bis 100 ein.",
    "treatmentIntent": "Behandlungsabsicht",
    "optionalHint": "Ein leerer optionaler Wert wird akzeptiert und bleibt null.",
    "ruleWarning": "REGELABHÄNGIGKEITEN ERFORDERN KLINISCHE UND AUSFÜHRBARE PRÜFUNG"
  },
  "review": {
    "title": "Überprüfung",
    "subtitle": "Bestätigen Sie die Eingaben vor dem Senden",
    "enteredValues": "Eingegebene Werte",
    "erPrHer2": "ER / PR / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "Stadium / Grad",
    "histology": "Histologie",
    "nodalStatusLabel": "Lymphknotenstatus",
    "nodalStatus": "Lymphknotenstatus",
    "ageLabel": "Alter",
    "age": "Alter",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "Chirurgiedatum",
    "surgeryDate": "Chirurgiedatum",
    "reasoningOptions": "Reasoning-Optionen",
    "bayesianLayer": "Bayesianische Ebene",
    "bayesianHint": "Setzt nur ein Anfragefeld. Keine Berechnung auf dem Gerät.",
    "baseline": "Baseline",
    "attestation": "Attestation",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · Ontologie-Hash stimmt mit dem akzeptierten Baseline-Manifest überein.",
    "checking": "Prüfung läuft…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · Ontologie-Hash stimmt mit dem akzeptierten Baseline-Manifest überein.",
    "submitBlocked": "Senden ist blockiert, solange die Attestation nicht VERIFIZIERT ist.",
    "submissionFailed": "Senden fehlgeschlagen",
    "provisionalP1": "Provisorische klinische Prüffelder — P1",
    "provisionalP2": "Provisorische klinische Prüffelder — P2",
    "tumorSize": "Tumorgröße",
    "genderReasoner": "Geschlecht (Reasoner)",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "Behandlungsabsicht",
    "p1NotMapped": "Nicht auf API abgebildet. Vertragsbestätigung ausstehend.",
    "p2RuleWarning": "Optionale Modifikatoren. Regelabhängigkeiten erfordern klinische Prüfung."
  },
  "result": {
    "title": "Bewertungsergebnis",
    "subtitle": "Serverseitiges Reasoning · synthetisches Profil",
    "noResult": "Kein Ergebnis verfügbar.",
    "newAssessment": "Neue Bewertung",
    "molecularSubtype": "Molekularer Subtyp",
    "bayesianConfidence": "Bayesianische Konfidenz",
    "confidenceHint": "Mittlere Konfidenz. Volle Präzision wird als sichtbare Integritätsprüfung angezeigt.",
    "bayesianHint": "Mittlere Konfidenz. Volle Präzision wird als sichtbare Integritätsprüfung angezeigt.",
    "rulesFired": "Ausgelöste Regeln",
    "rulesFiredHint": "Nur tatsächlich ausgelöste Regeln werden aufgeführt.",
    "recommendations": "Empfehlungen",
    "recommendationsHint": "Text wird vom Reasoner zurückgegeben und unverändert dargestellt.",
    "provenance": "Reasoning-Herkunft",
    "reasoningProvenance": "Reasoning-Herkunft",
    "retention": "Aufbewahrung",
    "retentionHint": "Dieses Ergebnis wird nur im Speicher gehalten. Das Verlassen dieses Bildschirms löscht die Bewertung. Nichts wird auf dem Gerät gespeichert.",
    "followUp": "Nachsorge",
    "biomarker": "Biomarker",
    "reasoningMode": "Reasoning-Modus",
    "reasonerVersion": "Reasoner",
    "responseContract": "Antwortvertrag",
    "timestamp": "Zeitstempel",
    "buildId": "Build-ID",
    "ontologySHA256": "Ontologie SHA-256",
    "tapToExpand": "zum Erweitern tippen"
  },
  "failClosed": {
    "title": "Dienst nicht verfügbar",
    "subtitle": "Baseline-Verifizierung fehlgeschlagen",
    "heading": "Bewertung blockiert",
    "blockedTitle": "Bewertung blockiert",
    "message": "Der Dienst konnte nicht verifizieren, dass der verbundene Reasoner mit der akzeptierten Baseline übereinstimmt. Keine Bewertung kann gesendet werden, bis die Verifizierung erfolgreich ist.",
    "blockedMessage": "Der Dienst konnte nicht verifizieren, dass der verbundene Reasoner mit der akzeptierten Baseline übereinstimmt. Keine Bewertung kann gesendet werden, bis die Verifizierung erfolgreich ist.",
    "verificationDetail": "Verifizierungsdetails",
    "expectedReasoner": "Erwarteter Reasoner",
    "observedReasoner": "Beobachteter Reasoner",
    "ontologyHash": "Ontologie-Hash",
    "notObserved": "nicht beobachtet",
    "observed": "beobachtet",
    "lastSuccessfulCheck": "Letzte erfolgreiche Prüfung",
    "expectedValuesHint": "Erwartete Werte stammen aus dem akzeptierten Baseline-Manifest; sie werden nie als Beobachtungen gemeldet.",
    "verificationHint": "Erwartete Werte stammen aus dem akzeptierten Baseline-Manifest; sie werden nie als Beobachtungen gemeldet.",
    "sameTreatment": "Gleiche Behandlung bei NICHT ÜBEREINSTIMMEND. Wiederholen führt nur die Verifizierung erneut aus — es wird nie eine Bewertung erneut gesendet.",
    "retryCheck": "Erneut versuchen",
    "state": "Status"
  },
  "about": {
    "title": "Info",
    "subtitle": "Build- und Baseline-Identität",
    "environment": "UMGEBUNG: EVALUIERUNG",
    "appSection": "Anwendung",
    "application": "Anwendung",
    "marketingVersion": "Marketing-Version",
    "nativeBuild": "Nativer Build",
    "easBuild": "EAS-Build / Profil",
    "easBuildProfile": "EAS-Build / Profil",
    "serviceSection": "Dienst",
    "service": "Dienst",
    "gateway": "Gateway",
    "reasoner": "Reasoner",
    "responseContractLabel": "Antwortvertrag",
    "responseContract": "Antwortvertrag",
    "reasoningModeLabel": "Reasoning-Modus",
    "reasoningMode": "Reasoning-Modus",
    "attestationSection": "Baseline-Attestation",
    "baselineAttestation": "Baseline-Attestation",
    "state": "Status",
    "lastVerified": "Zuletzt verifiziert",
    "ontologyHashLabel": "Ontologie SHA-256 (beobachtet, schreibgeschütztes Mount)",
    "ontologySha256": "Ontologie SHA-256 (beobachtet, schreibgeschütztes Mount)",
    "dataHandlingSection": "Datenverarbeitung",
    "dataHandling": "Datenverarbeitung",
    "dataHandlingText": "Keine beabsichtigte Speicherung klinischer Daten. Keine Analytik. Absturzberichte für Wave One deaktiviert. Over-the-Air-Updates deaktiviert — jede Änderung erfordert einen neuen geprüften Build.",
    "unknownValue": "NICHT VERFÜGBAR"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "Regel, die innerhalb der ACR-Regelbasis erstellt und befördert wurde",
    "openlletDesc": "Regel, die vom Openllet-Reasoner ausgewertet und verifiziert wurde"
  },
  "errors": {
    "schemaInvalid": "Ungültiges Eingabeformat. Bitte überprüfen Sie Ihre Eingaben.",
    "authRequired": "Sitzung abgelaufen. Bitte starten Sie die App neu und verwenden Sie Ihren Einladungscode.",
    "attestationMismatch": "Der verbundene Reasoner stimmt nicht mit der akzeptierten Baseline überein. Bewertung blockiert.",
    "attestationUnavailable": "Die Reasoner-Baseline konnte nicht verifiziert werden. Bitte versuchen Sie es erneut.",
    "serviceUnavailable": "Dienst vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.",
    "indeterminate": "Das Bewertungsergebnis ist ungewiss. Nicht automatisch wiederholen — kontaktieren Sie den Support.",
    "rateLimited": "Zu viele Anfragen. Bitte warten Sie, bevor Sie es erneut versuchen.",
    "networkError": "Netzwerkverbindung fehlgeschlagen. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut."
  }
}
EOFdeDE
echo "  [11/16] src/locales/de-DE.json"

# ─── 12. src/locales/ru-RU.json ───
backup_file "src/locales/ru-RU.json"
cat > src/locales/ru-RU.json << 'EOFruRU'
{
  "app": {
    "name": "ACR",
    "tagline": "Клиническая поддержка принятия решений · Компаньон",
    "trialBanner": "ИССЛЕДОВАТЕЛЬСКИЙ — ТОЛЬКО ПО ПРИГЛАШЕНИЮ"
  },
  "common": {
    "cancel": "Отмена",
    "back": "Назад",
    "next": "Далее",
    "review": "Проверить",
    "submit": "Отправить",
    "edit": "Изменить",
    "done": "Готово",
    "close": "Закрыть",
    "about": "О приложении",
    "retry": "Повторить проверку",
    "newAssessment": "Новая оценка",
    "required": "обязательно",
    "optional": "необязательно",
    "generated": "сгенерировано",
    "on": "ВКЛ",
    "off": "ВЫКЛ",
    "verified": "ПРОВЕРЕНО",
    "unavailable": "НЕДОСТУПНО",
    "mismatch": "НЕСООТВЕТСТВИЕ",
    "yes": "Да",
    "no": "Нет",
    "checking": "Проверка…",
    "emDash": "—",
    "negative": "негативный",
    "positive": "позитивный",
    "retryCheck": "Повторить проверку"
  },
  "welcome": {
    "title": "Перед началом",
    "description1": "Это приложение — клиент для демонстрации системы рассуждений ACR-Platform. Все вычисления выполняются на сервере.",
    "description2": "Только синтетические данные. Не вводите реальную, закодированную или псевдонимизированную информацию о пациентах.",
    "description3": "Намеренное хранение клинических данных отсутствует. Данные существуют в памяти только во время одной оценки.",
    "description4": "Не для диагностики или лечения.",
    "beginButton": "Я понимаю — Начать",
    "languageSelector": "Язык"
  },
  "assessment": {
    "newTitle": "Новая оценка",
    "step1Subtitle": "Шаг 1 из 5 · Статус рецепторов",
    "step2Subtitle": "Шаг 2 из 5 · Характеристики опухоли",
    "step3Subtitle": "Шаг 3 из 5 · Биомаркеры и хирургия",
    "p1Subtitle": "Шаг 4 из 5 · Предварительное расширение P1",
    "p2Subtitle": "Шаг 5 из 5 · Предварительное расширение P2",
    "stepSubtitle": "Шаг {{current}} из {{total}} · {{title}}",
    "reviewTitle": "Проверка",
    "reviewSubtitle": "Подтвердите данные перед отправкой",
    "clinicalTransparency": "Клиническая прозрачность: результаты являются исключительно вспомогательным инструментом для принятия решений, созданным на основе проверенной базы правил. Клиническое решение остаётся за врачом.",
    "clinicalTransparencyBanner": "Клиническая прозрачность: результаты являются исключительно вспомогательным инструментом для принятия решений, созданным на основе проверенной базы правил. Клиническое решение остаётся за врачом."
  },
  "receptors": {
    "cardTitle": "Статус рецепторов",
    "stepTitle": "Статус рецепторов",
    "erStatus": "Статус ЭР",
    "prStatus": "Статус ПР",
    "her2Status": "Статус HER2",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100. Люминальный A < 14, Люминальный B ≥ 14. Только справочно — классификация выполняется системой рассуждений.",
    "positive": "позитивный",
    "negative": "негативный",
    "sessionId": "ID сессии",
    "sessionIdHint": "Новый UUIDv4 для каждой оценки. Никогда не вводится, не используется повторно и не сохраняется.",
    "sessionLabel": "Сессия"
  },
  "tumour": {
    "cardTitle": "Опухоль",
    "stepTitle": "Характеристики опухоли",
    "stage": "Стадия",
    "stageHint": "Значения из фиксированного перечня API-контракта — без перекрывающихся псевдонимов.",
    "grade": "Степень",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "Гистологический подтип",
    "histologyIDC": "IDC — инвазивная протоковая карцинома",
    "histologyILC": "ILC — инвазивная дольковая карцинома",
    "histologyDCIS": "DCIS — протоковая карцинома in situ",
    "histologyPaget": "Болезнь Пажета",
    "nodalStatus": "Статус лимфоузлов",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "Возраст (лет)",
    "ageHint": "18–120, полных лет. Возраст — единственное демографическое поле, которое обрабатывает система рассуждений."
  },
  "biomarkers": {
    "cardTitle": "Серумные маркеры",
    "ca153": "CA 15-3 (Ед/мл)",
    "ca153Hint": "Пороговое значение 35,0 — оценка выполняется на сервере.",
    "cea": "CEA (нг/мл)",
    "ceaHint": "Пороговое значение 5,0 — оценка выполняется на сервере.",
    "surgeryDate": "Дата операции",
    "surgeryDateHint": "Будущие даты разрешены и отправляются без изменений: контроль B3 — ответственность системы рассуждений и должен оставаться тестируемым.",
    "surgeryCardTitle": "Хирургия"
  },
  "markers": {
    "stepTitle": "Биомаркеры и хирургия",
    "serumMarkersTitle": "Серумные маркеры",
    "ca153": "CA 15-3 (Ед/мл)",
    "ca153Hint": "Пороговое значение 35,0 — оценка выполняется на сервере.",
    "cea": "CEA (нг/мл)",
    "ceaHint": "Пороговое значение 5,0 — оценка выполняется на сервере.",
    "surgeryTitle": "Хирургия",
    "surgeryDate": "Дата операции",
    "surgeryDateHint": "Будущие даты разрешены и отправляются без изменений: контроль B3 — ответственность системы рассуждений и должен оставаться тестируемым."
  },
  "session": {
    "cardTitle": "Сессия",
    "sessionId": "ID сессии",
    "sessionIdHint": "Новый UUIDv4 для каждой оценки. Никогда не вводится, не используется повторно и не сохраняется."
  },
  "p1": {
    "stepTitle": "Предварительное расширение P1 · Основные входные данные",
    "cardTitle": "Основные входные данные, требующие подтверждения",
    "tumorSize": "Размер опухоли",
    "tumorSizeHint": "Конечное число больше нуля. Единица и максимум должны быть подтверждены до сопоставления интерфейса.",
    "tumorSizeError": "Введите конечное числовое значение больше нуля.",
    "gender": "Пол / гендер, используемый системой рассуждений",
    "genderHint": "Нет значения по умолчанию. Отображаемая формулировка и wire-значение требуют подтверждения.",
    "genderError": "Нет доступного принятого контрактного enum. Значение не принято.",
    "nodalWarning": "Ожидает сопоставления узлов: текущий интерфейс N0–N3 не преобразуется автоматически в положительный/отрицательный.",
    "contractNote": "Примечание к контракту: значения остаются в памяти и не сопоставляются с API-запросом в этом обновлении.",
    "blockerTitle": "Блокировщик контракта — не ошибка ввода",
    "blockerText": "статус узлов нельзя сопоставить, пока семантика N0–N3 против положительный/отрицательный остаётся неразрешённой."
  },
  "p2": {
    "stepTitle": "Предварительное расширение P2 · Модификаторы решений",
    "performanceTitle": "Производительность и биология опухоли",
    "ecog": "Статус производительности ECOG",
    "ecogError": "Введите целочисленный балл ECOG от 0 до 4.",
    "pdl1": "Статус PD-L1",
    "her2Low": "HER2-low",
    "safetyTitle": "Безопасность лечения и намерение",
    "lvef": "LVEF (%)",
    "lvefHint": "Конечный процент, 0–100 включительно.",
    "lvefError": "Введите конечный процент от 0 до 100.",
    "treatmentIntent": "Намерение лечения",
    "optionalHint": "Пустое необязательное значение принимается и остаётся null.",
    "ruleWarning": "ЗАВИСИМОСТИ ПРАВИЛ ТРЕБУЮТ КЛИНИЧЕСКОЙ И ИСПОЛНЯЕМОЙ ПРОВЕРКИ"
  },
  "review": {
    "title": "Проверка",
    "subtitle": "Подтвердите данные перед отправкой",
    "enteredValues": "Введённые значения",
    "erPrHer2": "ЭР / ПР / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "Стадия / Степень",
    "histology": "Гистология",
    "nodalStatusLabel": "Статус лимфоузлов",
    "nodalStatus": "Статус лимфоузлов",
    "ageLabel": "Возраст",
    "age": "Возраст",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "Дата операции",
    "surgeryDate": "Дата операции",
    "reasoningOptions": "Параметры рассуждения",
    "bayesianLayer": "Байесовский слой",
    "bayesianHint": "Устанавливает только поле запроса. Вычисления на устройстве не производятся.",
    "baseline": "Базовая линия",
    "attestation": "Аттестация",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · хеш онтологии соответствует принятому базовому манифесту.",
    "checking": "Проверка…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · хеш онтологии соответствует принятому базовому манифесту.",
    "submitBlocked": "Отправка заблокирована, пока аттестация не ПРОВЕРЕНА.",
    "submissionFailed": "Отправка не удалась",
    "provisionalP1": "Предварительные поля клинического обзора — P1",
    "provisionalP2": "Предварительные поля клинического обзора — P2",
    "tumorSize": "Размер опухоли",
    "genderReasoner": "Пол (система рассуждений)",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "Намерение лечения",
    "p1NotMapped": "Не сопоставлено с API. Ожидается подтверждение контракта.",
    "p2RuleWarning": "Необязательные модификаторы. Зависимости правил требуют клинической проверки."
  },
  "result": {
    "title": "Результат оценки",
    "subtitle": "Серверное рассуждение · синтетический профиль",
    "noResult": "Результат недоступен.",
    "newAssessment": "Новая оценка",
    "molecularSubtype": "Молекулярный подтип",
    "bayesianConfidence": "Байесовская достоверность",
    "confidenceHint": "Умеренная достоверность. Полная точность отображается как видимая проверка целостности.",
    "bayesianHint": "Умеренная достоверность. Полная точность отображается как видимая проверка целостности.",
    "rulesFired": "Сработавшие правила",
    "rulesFiredHint": "Перечислены только фактически сработавшие правила.",
    "recommendations": "Рекомендации",
    "recommendationsHint": "Текст возвращается системой рассуждений и отображается без изменений.",
    "provenance": "Происхождение рассуждения",
    "reasoningProvenance": "Происхождение рассуждения",
    "retention": "Хранение",
    "retentionHint": "Этот результат хранится только в памяти. При выходе с этого экрана оценка удаляется. На устройство ничего не записывается.",
    "followUp": "Наблюдение",
    "biomarker": "Биомаркер",
    "reasoningMode": "Режим рассуждения",
    "reasonerVersion": "Система рассуждений",
    "responseContract": "Контракт ответа",
    "timestamp": "Метка времени",
    "buildId": "ID сборки",
    "ontologySHA256": "SHA-256 онтологии",
    "tapToExpand": "нажмите для развёртывания"
  },
  "failClosed": {
    "title": "Сервис недоступен",
    "subtitle": "Проверка базовой линии не удалась",
    "heading": "Оценка заблокирована",
    "blockedTitle": "Оценка заблокирована",
    "message": "Сервис не смог проверить, что подключённая система рассуждений соответствует принятой базовой линии. Оценка не может быть отправлена до успешной проверки.",
    "blockedMessage": "Сервис не смог проверить, что подключённая система рассуждений соответствует принятой базовой линии. Оценка не может быть отправлена до успешной проверки.",
    "verificationDetail": "Детали проверки",
    "expectedReasoner": "Ожидаемая система",
    "observedReasoner": "Наблюдаемая система",
    "ontologyHash": "Хеш онтологии",
    "notObserved": "не наблюдается",
    "observed": "наблюдается",
    "lastSuccessfulCheck": "Последняя успешная проверка",
    "expectedValuesHint": "Ожидаемые значения берутся из принятого базового манифеста; они никогда не сообщаются как наблюдения.",
    "verificationHint": "Ожидаемые значения берутся из принятого базового манифеста; они никогда не сообщаются как наблюдения.",
    "sameTreatment": "То же самое при НЕСООТВЕТСТВИИ. Повторная попытка запускает только проверку — оценка никогда не переотправляется.",
    "retryCheck": "Повторить проверку",
    "state": "Состояние"
  },
  "about": {
    "title": "О приложении",
    "subtitle": "Идентификация сборки и базовой линии",
    "environment": "СРЕДА: ОЦЕНКА",
    "appSection": "Приложение",
    "application": "Приложение",
    "marketingVersion": "Маркетинговая версия",
    "nativeBuild": "Нативная сборка",
    "easBuild": "Сборка EAS / профиль",
    "easBuildProfile": "Сборка EAS / профиль",
    "serviceSection": "Сервис",
    "service": "Сервис",
    "gateway": "Шлюз",
    "reasoner": "Система рассуждений",
    "responseContractLabel": "Контракт ответа",
    "responseContract": "Контракт ответа",
    "reasoningModeLabel": "Режим рассуждения",
    "reasoningMode": "Режим рассуждения",
    "attestationSection": "Базовая аттестация",
    "baselineAttestation": "Базовая аттестация",
    "state": "Состояние",
    "lastVerified": "Последняя проверка",
    "ontologyHashLabel": "SHA-256 онтологии (наблюдаемый, монтирование только для чтения)",
    "ontologySha256": "SHA-256 онтологии (наблюдаемый, монтирование только для чтения)",
    "dataHandlingSection": "Обработка данных",
    "dataHandling": "Обработка данных",
    "dataHandlingText": "Намеренное хранение клинических данных отсутствует. Аналитика отключена. Отчёты о сбоях отключены для первой волны. OTA-обновления отключены — каждое изменение требует новой проверенной сборки.",
    "unknownValue": "НЕДОСТУПНО"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "Правило, созданное и продвинутое в рамках базы правил ACR",
    "openlletDesc": "Правило, оцененное и проверенное системой рассуждений Openllet"
  },
  "errors": {
    "schemaInvalid": "Неверный формат ввода. Пожалуйста, проверьте ваши данные.",
    "authRequired": "Сессия истекла. Пожалуйста, перезапустите приложение и используйте код приглашения.",
    "attestationMismatch": "Подключённая система рассуждений не соответствует принятой базовой линии. Оценка заблокирована.",
    "attestationUnavailable": "Не удалось проверить базовую линию системы рассуждений. Пожалуйста, повторите попытку.",
    "serviceUnavailable": "Сервис временно недоступен. Пожалуйста, попробуйте позже.",
    "indeterminate": "Результат оценки неопределён. Не повторяйте автоматически — обратитесь в поддержку.",
    "rateLimited": "Слишком много запросов. Пожалуйста, подождите перед повторной попыткой.",
    "networkError": "Ошибка сетевого подключения. Пожалуйста, проверьте подключение и повторите попытку."
  }
}
EOFruRU
echo "  [12/16] src/locales/ru-RU.json"

# ─── 13. src/locales/ar-SA.json ───
backup_file "src/locales/ar-SA.json"
cat > src/locales/ar-SA.json << 'EOFarSA'
{
  "app": {
    "name": "ACR",
    "tagline": "الدعم السريري لاتخاذ القرار · المرافق",
    "trialBanner": "بحثي — فقط بتقييم الدعوة"
  },
  "common": {
    "cancel": "إلغاء",
    "back": "رجوع",
    "next": "التالي",
    "review": "مراجعة",
    "submit": "إرسال",
    "edit": "تعديل",
    "done": "تم",
    "close": "إغلاق",
    "about": "حول",
    "retry": "إعادة المحاولة",
    "newAssessment": "تقييم جديد",
    "required": "مطلوب",
    "optional": "اختياري",
    "generated": "تم إنشاؤه",
    "on": "مفعل",
    "off": "معطل",
    "verified": "تم التحقق",
    "unavailable": "غير متاح",
    "mismatch": "عدم تطابق",
    "yes": "نعم",
    "no": "لا",
    "checking": "جاري التحقق…",
    "emDash": "—",
    "negative": "سلبي",
    "positive": "إيجابي",
    "retryCheck": "إعادة المحاولة"
  },
  "welcome": {
    "title": "قبل أن تبدأ",
    "description1": "هذا التطبيق هو عميل عرض لنظام الاستدلال ACR-Platform. كل الاستدلال يحدث على جانب الخادم.",
    "description2": "بيانات تركيبية فقط. لا تدخل معلومات مريض حقيقية أو مشفرة أو مؤسسة.",
    "description3": "لا توجد بيانات سريرية مقصودة في الراحة. المدخلات موجودة في الذاكرة لتقييم واحد فقط.",
    "description4": "ليس للتشخيص أو العلاج.",
    "beginButton": "أفهم — ابدأ",
    "languageSelector": "اللغة"
  },
  "assessment": {
    "newTitle": "تقييم جديد",
    "step1Subtitle": "الخطوة 1 من 5 · حالة المستقبلات",
    "step2Subtitle": "الخطوة 2 من 5 · خصائص الورم",
    "step3Subtitle": "الخطوة 3 من 5 · المؤشرات الحيوية والجراحة",
    "p1Subtitle": "الخطوة 4 من 5 · الامتداد المؤقت P1",
    "p2Subtitle": "الخطوة 5 من 5 · الامتداد المؤقت P2",
    "stepSubtitle": "الخطوة {{current}} من {{total}} · {{title}}",
    "reviewTitle": "مراجعة",
    "reviewSubtitle": "أكد المدخلات قبل الإرسال",
    "clinicalTransparency": "الشفافية السريرية: النواتج هي دعم للقرار فقط، تم إنشاؤها بواسطة قاعدة قواعد متحقق منها. يبقى الحكم السريري مع الطبيب.",
    "clinicalTransparencyBanner": "الشفافية السريرية: النواتج هي دعم للقرار فقط، تم إنشاؤها بواسطة قاعدة قواعد متحقق منها. يبقى الحكم السريري مع الطبيب."
  },
  "receptors": {
    "cardTitle": "حالة المستقبلات",
    "stepTitle": "حالة المستقبلات",
    "erStatus": "حالة ER",
    "prStatus": "حالة PR",
    "her2Status": "حالة HER2",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100. Luminal A < 14, Luminal B ≥ 14. للإرشاد فقط — التصنيف يتم بواسطة نظام الاستدلال.",
    "positive": "إيجابي",
    "negative": "سلبي",
    "sessionId": "معرف الجلسة",
    "sessionIdHint": "UUIDv4 جديد لكل تقييم. لا يُدخل أبدًا، ولا يُعاد استخدامه، ولا يُحفظ.",
    "sessionLabel": "الجلسة"
  },
  "tumour": {
    "cardTitle": "الورم",
    "stepTitle": "خصائص الورم",
    "stage": "المرحلة",
    "stageHint": "القيم من قائمة عقد API المجمدة — لا توجد أسماء مستعارة متداخلة.",
    "grade": "الدرجة",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "النوع الفرعي النسيجي",
    "histologyIDC": "IDC — سرطان القنوات الغازي",
    "histologyILC": "ILC — سرطان الفصيصات الغازي",
    "histologyDCIS": "DCIS — سرطان القنوات في موضعه",
    "histologyPaget": "مرض باجيت",
    "nodalStatus": "حالة العقد",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "العمر (سنوات)",
    "ageHint": "18–120، سنوات كاملة. العمر هو الحقل الديموغرافي الوحيد الذي يستهلكه نظام الاستدلال."
  },
  "biomarkers": {
    "cardTitle": "مؤشرات المصل",
    "ca153": "CA 15-3 (وحدة/مل)",
    "ca153Hint": "عتبة المرجع 35.0 — التقييم يتم على جانب الخادم.",
    "cea": "CEA (نانوغرام/مل)",
    "ceaHint": "عتبة المرجع 5.0 — التقييم يتم على جانب الخادم.",
    "surgeryDate": "تاريخ الجراحة",
    "surgeryDateHint": "التواريخ المستقبلية مسموح بها وتُرسل دون تغيير: حارس B3 هو مسؤولية نظام الاستدلال ويجب أن يبقى قابلاً للاختبار.",
    "surgeryCardTitle": "الجراحة"
  },
  "markers": {
    "stepTitle": "المؤشرات الحيوية والجراحة",
    "serumMarkersTitle": "مؤشرات المصل",
    "ca153": "CA 15-3 (وحدة/مل)",
    "ca153Hint": "عتبة المرجع 35.0 — التقييم يتم على جانب الخادم.",
    "cea": "CEA (نانوغرام/مل)",
    "ceaHint": "عتبة المرجع 5.0 — التقييم يتم على جانب الخادم.",
    "surgeryTitle": "الجراحة",
    "surgeryDate": "تاريخ الجراحة",
    "surgeryDateHint": "التواريخ المستقبلية مسموح بها وتُرسل دون تغيير: حارس B3 هو مسؤولية نظام الاستدلال ويجب أن يبقى قابلاً للاختبار."
  },
  "session": {
    "cardTitle": "الجلسة",
    "sessionId": "معرف الجلسة",
    "sessionIdHint": "UUIDv4 جديد لكل تقييم. لا يُدخل أبدًا، ولا يُعاد استخدامه، ولا يُحفظ."
  },
  "p1": {
    "stepTitle": "الامتداد المؤقت P1 · المدخلات الأساسية",
    "cardTitle": "المدخلات الأساسية التي تتطلب تأكيدًا",
    "tumorSize": "حجم الورم",
    "tumorSizeHint": "رقم محدود أكبر من الصفر. يجب تأكيد الوحدة والحد الأقصى قبل ربط الواجهة.",
    "tumorSizeError": "أدخل قيمة رقمية محدودة أكبر من الصفر.",
    "gender": "الجنس / الجنس المستخدم بواسطة نظام الاستدلال",
    "genderHint": "لا يوجد افتراضي. صيغة العرض وقيمة السلك تتطلب تأكيدًا.",
    "genderError": "لا يوجد تعداد تعاقدي مقبول متاح. لم يتم افتراض أي قيمة.",
    "nodalWarning": "الربط العقدي معلق: واجهة المستخدم الحالية N0–N3 لا تُحوَّل صامتة إلى إيجابي/سلبي.",
    "contractNote": "ملاحظة تعاقدية: تبقى القيم في الذاكرة ولا تُربط بطلب API في هذا التحديث.",
    "blockerTitle": "حاجز تعاقدي — ليس خطأ إدخال",
    "blockerText": "لا يمكن ربط الحالة العقدية بينما تبقى دلالات N0–N3 مقابل إيجابي/سلبي غير محسومة."
  },
  "p2": {
    "stepTitle": "الامتداد المؤقت P2 · معدِّلات القرار",
    "performanceTitle": "الأداء وبيولوجيا الورم",
    "ecog": "حالة الأداء ECOG",
    "ecogError": "أدخل درجة ECOG صحيحة من 0 إلى 4.",
    "pdl1": "حالة PD-L1",
    "her2Low": "HER2-low",
    "safetyTitle": "سلامة العلاج والنية",
    "lvef": "LVEF (%)",
    "lvefHint": "نسبة مئوية محدودة، 0–100 شاملة.",
    "lvefError": "أدخل نسبة مئوية محدودة من 0 إلى 100.",
    "treatmentIntent": "نية العلاج",
    "optionalHint": "يتم قبول قيمة اختيارية فارغة وتبقى null.",
    "ruleWarning": "تبعيات القواعد تتطلب مراجعة سريرية وتنفيذية"
  },
  "review": {
    "title": "مراجعة",
    "subtitle": "أكد المدخلات قبل الإرسال",
    "enteredValues": "القيم المدخلة",
    "erPrHer2": "ER / PR / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "المرحلة / الدرجة",
    "histology": "النسيج",
    "nodalStatusLabel": "حالة العقد",
    "nodalStatus": "حالة العقد",
    "ageLabel": "العمر",
    "age": "العمر",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "تاريخ الجراحة",
    "surgeryDate": "تاريخ الجراحة",
    "reasoningOptions": "خيارات الاستدلال",
    "bayesianLayer": "الطبقة البايزية",
    "bayesianHint": "يضبط حقل طلب فقط. لا يحدث حساب على الجهاز.",
    "baseline": "خط الأساس",
    "attestation": "الشهادة",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · تجزئة الأنطولوجيا تطابق البيان الأساسي المقبول.",
    "checking": "جاري التحقق…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · تجزئة الأنطولوجيا تطابق البيان الأساسي المقبول.",
    "submitBlocked": "الإرسال محظور ما لم تكن الشهادة تم التحقق منها.",
    "submissionFailed": "فشل الإرسال",
    "provisionalP1": "حقول المراجعة السريرية المؤقتة — P1",
    "provisionalP2": "حقول المراجعة السريرية المؤقتة — P2",
    "tumorSize": "حجم الورم",
    "genderReasoner": "الجنس (نظام الاستدلال)",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "نية العلاج",
    "p1NotMapped": "غير مرتبط بـ API. في انتظار تأكيد العقد.",
    "p2RuleWarning": "معدِّلات اختيارية. تبعيات القواعد تتطلب مراجعة سريرية."
  },
  "result": {
    "title": "نتيجة التقييم",
    "subtitle": "استدلال جانب الخادم · ملف تركيبي",
    "noResult": "لا توجد نتيجة متاحة.",
    "newAssessment": "تقييم جديد",
    "molecularSubtype": "النوع الجزيئي",
    "bayesianConfidence": "الثقة البايزية",
    "confidenceHint": "ثقة معتدلة. الدقة الكاملة معروضة كفحص واضح للسلامة.",
    "bayesianHint": "ثقة معتدلة. الدقة الكاملة معروضة كفحص واضح للسلامة.",
    "rulesFired": "القواعد المُفعَّلة",
    "rulesFiredHint": "فقط القواعد التي تم تفعيلها فعليًا مدرجة.",
    "recommendations": "التوصيات",
    "recommendationsHint": "النص يُعاد بواسطة نظام الاستدلال ويُعرض دون تغيير.",
    "provenance": "أصل الاستدلال",
    "reasoningProvenance": "أصل الاستدلال",
    "retention": "الاحتفاظ",
    "retentionHint": "هذه النتيجة محفوظة في الذاكرة فقط. مغادرة هذه الشاشة تمسح التقييم. لا شيء يُكتب على تخزين الجهاز.",
    "followUp": "المتابعة",
    "biomarker": "المؤشر الحيوي",
    "reasoningMode": "وضع الاستدلال",
    "reasonerVersion": "نظام الاستدلال",
    "responseContract": "عقد الاستجابة",
    "timestamp": "الطابع الزمني",
    "buildId": "معرف البناء",
    "ontologySHA256": "SHA-256 الأنطولوجيا",
    "tapToExpand": "اضغط للتوسيع"
  },
  "failClosed": {
    "title": "الخدمة غير متاحة",
    "subtitle": "فشل التحقق من خط الأساس",
    "heading": "التقييم محظور",
    "blockedTitle": "التقييم محظور",
    "message": "تعذر على الخدمة التحقق من أن نظام الاستدلال المتصل يطابق خط الأساس المقبول. لا يمكن إرسال أي تقييم حتى ينجح التحقق.",
    "blockedMessage": "تعذر على الخدمة التحقق من أن نظام الاستدلال المتصل يطابق خط الأساس المقبول. لا يمكن إرسال أي تقييم حتى ينجح التحقق.",
    "verificationDetail": "تفاصيل التحقق",
    "expectedReasoner": "نظام الاستدلال المتوقع",
    "observedReasoner": "نظام الاستدلال الملاحظ",
    "ontologyHash": "تجزئة الأنطولوجيا",
    "notObserved": "غير ملاحظ",
    "observed": "ملاحظ",
    "lastSuccessfulCheck": "آخر فحص ناجح",
    "expectedValuesHint": "القيم المتوقعة تأتي من البيان الأساسي المقبول؛ لا تُبلَّغ أبدًا كملاحظات.",
    "verificationHint": "القيم المتوقعة تأتي من البيان الأساسي المقبول؛ لا تُبلَّغ أبدًا كملاحظات.",
    "sameTreatment": "نفس المعاملة لعدم التطابق. إعادة المحاولة تُعيد التحقق فقط — لا تُعيد إرسال التقييم أبدًا.",
    "retryCheck": "إعادة المحاولة",
    "state": "الحالة"
  },
  "about": {
    "title": "حول",
    "subtitle": "هوية البناء وخط الأساس",
    "environment": "البيئة: تقييم",
    "appSection": "التطبيق",
    "application": "التطبيق",
    "marketingVersion": "الإصدار التسويقي",
    "nativeBuild": "البناء الأصلي",
    "easBuild": "بناء EAS / الملف الشخصي",
    "easBuildProfile": "بناء EAS / الملف الشخصي",
    "serviceSection": "الخدمة",
    "service": "الخدمة",
    "gateway": "البوابة",
    "reasoner": "نظام الاستدلال",
    "responseContractLabel": "عقد الاستجابة",
    "responseContract": "عقد الاستجابة",
    "reasoningModeLabel": "وضع الاستدلال",
    "reasoningMode": "وضع الاستدلال",
    "attestationSection": "شهادة خط الأساس",
    "baselineAttestation": "شهادة خط الأساس",
    "state": "الحالة",
    "lastVerified": "آخر تحقق",
    "ontologyHashLabel": "SHA-256 الأنطولوجيا (ملاحظ، نقطة وصول للقراءة فقط)",
    "ontologySha256": "SHA-256 الأنطولوجيا (ملاحظ، نقطة وصول للقراءة فقط)",
    "dataHandlingSection": "معالجة البيانات",
    "dataHandling": "معالجة البيانات",
    "dataHandlingText": "لا توجد بيانات سريرية مقصودة في الراحة. لا تحليلات. تقارير الأعطال معطلة للموجة الأولى. التحديثات عبر الهواء معطلة — كل تغيير يتطلب بناءً مراجعًا جديدًا.",
    "unknownValue": "غير متاح"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "قاعدة تم تأليفها وتعزيزها ضمن قاعدة قواعد ACR",
    "openlletDesc": "قاعدة تم تقييمها والتحقق منها بواسطة نظام الاستدلال Openllet"
  },
  "errors": {
    "schemaInvalid": "تنسيق الإدخال غير صالح. يرجى التحقق من إدخالاتك.",
    "authRequired": "انتهت الجلسة. يرجى إعادة تشغيل التطبيق واستخدام رمز الدعوة.",
    "attestationMismatch": "نظام الاستدلال المتصل لا يطابق خط الأساس المقبول. التقييم محظور.",
    "attestationUnavailable": "تعذر التحقق من خط أساس نظام الاستدلال. يرجى إعادة المحاولة.",
    "serviceUnavailable": "الخدمة غير متاحة مؤقتًا. يرجى المحاولة لاحقًا.",
    "indeterminate": "نتيجة التقييم غير مؤكدة. لا تُعِد المحاولة تلقائيًا — اتصل بالدعم.",
    "rateLimited": "طلبات كثيرة جدًا. يرجى الانتظار قبل إعادة المحاولة.",
    "networkError": "فشل الاتصال بالشبكة. يرجى التحقق من الاتصال وإعادة المحاولة."
  }
}
EOFarSA
echo "  [13/16] src/locales/ar-SA.json"

# ─── 14. src/locales/zh-CN.json ───
backup_file "src/locales/zh-CN.json"
cat > src/locales/zh-CN.json << 'EOFzhCN'
{
  "app": {
    "name": "ACR",
    "tagline": "临床决策支持 · 伴侣",
    "trialBanner": "研究中 — 仅限受邀评估"
  },
  "common": {
    "cancel": "取消",
    "back": "返回",
    "next": "下一步",
    "review": "查看",
    "submit": "提交",
    "edit": "编辑",
    "done": "完成",
    "close": "关闭",
    "about": "关于",
    "retry": "重试",
    "newAssessment": "新评估",
    "required": "必填",
    "optional": "选填",
    "generated": "已生成",
    "on": "开启",
    "off": "关闭",
    "verified": "已验证",
    "unavailable": "不可用",
    "mismatch": "不匹配",
    "yes": "是",
    "no": "否",
    "checking": "检查中…",
    "emDash": "—",
    "negative": "阴性",
    "positive": "阳性",
    "retryCheck": "重试"
  },
  "welcome": {
    "title": "开始前",
    "description1": "此应用是 ACR-Platform 推理引擎的展示客户端。所有推理均在服务器端进行。",
    "description2": "仅使用合成数据。请勿输入真实、编码或假名化的患者信息。",
    "description3": "不主动存储临床数据。输入仅在一次评估期间存在于内存中。",
    "description4": "不用于诊断或治疗。",
    "beginButton": "我理解 — 开始",
    "languageSelector": "语言"
  },
  "assessment": {
    "newTitle": "新评估",
    "step1Subtitle": "第 1 步，共 5 步 · 受体状态",
    "step2Subtitle": "第 2 步，共 5 步 · 肿瘤特征",
    "step3Subtitle": "第 3 步，共 5 步 · 生物标志物和手术",
    "p1Subtitle": "第 4 步，共 5 步 · 临时扩展 P1",
    "p2Subtitle": "第 5 步，共 5 步 · 临时扩展 P2",
    "stepSubtitle": "第 {{current}} 步，共 {{total}} 步 · {{title}}",
    "reviewTitle": "查看",
    "reviewSubtitle": "提交前确认输入",
    "clinicalTransparency": "临床透明度：输出仅为决策支持，由经过验证的规则库生成。临床判断仍由临床医生负责。",
    "clinicalTransparencyBanner": "临床透明度：输出仅为决策支持，由经过验证的规则库生成。临床判断仍由临床医生负责。"
  },
  "receptors": {
    "cardTitle": "受体状态",
    "stepTitle": "受体状态",
    "erStatus": "ER 状态",
    "prStatus": "PR 状态",
    "her2Status": "HER2 状态",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100。Luminal A < 14，Luminal B ≥ 14。仅供参考 — 分类由推理引擎执行。",
    "positive": "阳性",
    "negative": "阴性",
    "sessionId": "会话 ID",
    "sessionIdHint": "每次评估生成新的 UUIDv4。从不输入、从不重复使用、从不持久化。",
    "sessionLabel": "会话"
  },
  "tumour": {
    "cardTitle": "肿瘤",
    "stepTitle": "肿瘤特征",
    "stage": "分期",
    "stageHint": "值来自固定的 API 合同枚举 — 无重叠别名。",
    "grade": "分级",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "组织学亚型",
    "histologyIDC": "IDC — 浸润性导管癌",
    "histologyILC": "ILC — 浸润性小叶癌",
    "histologyDCIS": "DCIS — 导管原位癌",
    "histologyPaget": "佩吉特病",
    "nodalStatus": "淋巴结状态",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "年龄（岁）",
    "ageHint": "18–120，整岁。年龄是推理引擎唯一消耗的人口统计学字段。"
  },
  "biomarkers": {
    "cardTitle": "血清标志物",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "参考阈值 35.0 — 评估在服务器端执行。",
    "cea": "CEA (ng/mL)",
    "ceaHint": "参考阈值 5.0 — 评估在服务器端执行。",
    "surgeryDate": "手术日期",
    "surgeryDateHint": "允许未来日期且原样提交：B3 守卫是推理引擎的责任，必须保持可测试。",
    "surgeryCardTitle": "手术"
  },
  "markers": {
    "stepTitle": "生物标志物和手术",
    "serumMarkersTitle": "血清标志物",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "参考阈值 35.0 — 评估在服务器端执行。",
    "cea": "CEA (ng/mL)",
    "ceaHint": "参考阈值 5.0 — 评估在服务器端执行。",
    "surgeryTitle": "手术",
    "surgeryDate": "手术日期",
    "surgeryDateHint": "允许未来日期且原样提交：B3 守卫是推理引擎的责任，必须保持可测试。"
  },
  "session": {
    "cardTitle": "会话",
    "sessionId": "会话 ID",
    "sessionIdHint": "每次评估生成新的 UUIDv4。从不输入、从不重复使用、从不持久化。"
  },
  "p1": {
    "stepTitle": "临时扩展 P1 · 核心输入",
    "cardTitle": "需要确认的核心输入",
    "tumorSize": "肿瘤大小",
    "tumorSizeHint": "大于零的有限数字。在接口映射之前必须确认单位和最大值。",
    "tumorSizeError": "输入大于零的有限数值。",
    "gender": "性别 / 推理引擎使用的性别",
    "genderHint": "无默认值。显示措辞和传输值需要确认。",
    "genderError": "无可用的已接受合同枚举。未假设任何值。",
    "nodalWarning": "淋巴结映射待处理：当前界面 N0–N3 不会静默转换为阳性/阴性。",
    "contractNote": "合同说明：值保留在内存中，在此更新中不会映射到 API 请求。",
    "blockerTitle": "合同阻断器 — 非输入错误",
    "blockerText": "在 N0–N3 与阳性/阴性语义未解决之前，无法映射淋巴结状态。"
  },
  "p2": {
    "stepTitle": "临时扩展 P2 · 决策修饰符",
    "performanceTitle": "表现和肿瘤生物学",
    "ecog": "ECOG 表现状态",
    "ecogError": "输入 0 到 4 的整数 ECOG 评分。",
    "pdl1": "PD-L1 状态",
    "her2Low": "HER2-low",
    "safetyTitle": "治疗安全性和意图",
    "lvef": "LVEF (%)",
    "lvefHint": "有限百分比，0–100（含）。",
    "lvefError": "输入 0 到 100 的有限百分比。",
    "treatmentIntent": "治疗意图",
    "optionalHint": "接受空的可选值并保持为 null。",
    "ruleWarning": "规则依赖需要临床和可执行审查"
  },
  "review": {
    "title": "查看",
    "subtitle": "提交前确认输入",
    "enteredValues": "已输入值",
    "erPrHer2": "ER / PR / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "分期 / 分级",
    "histology": "组织学",
    "nodalStatusLabel": "淋巴结状态",
    "nodalStatus": "淋巴结状态",
    "ageLabel": "年龄",
    "age": "年龄",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "手术日期",
    "surgeryDate": "手术日期",
    "reasoningOptions": "推理选项",
    "bayesianLayer": "贝叶斯层",
    "bayesianHint": "仅设置请求字段。设备上不进行计算。",
    "baseline": "基线",
    "attestation": "认证",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · 本体哈希与已接受的基线清单匹配。",
    "checking": "检查中…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · 本体哈希与已接受的基线清单匹配。",
    "submitBlocked": "除非认证为已验证，否则提交被阻止。",
    "submissionFailed": "提交失败",
    "provisionalP1": "临时临床审查字段 — P1",
    "provisionalP2": "临时临床审查字段 — P2",
    "tumorSize": "肿瘤大小",
    "genderReasoner": "性别（推理引擎）",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "治疗意图",
    "p1NotMapped": "未映射到 API。合同确认待处理。",
    "p2RuleWarning": "可选修饰符。规则依赖需要临床审查。"
  },
  "result": {
    "title": "评估结果",
    "subtitle": "服务器端推理 · 合成档案",
    "noResult": "无可用结果。",
    "newAssessment": "新评估",
    "molecularSubtype": "分子亚型",
    "bayesianConfidence": "贝叶斯置信度",
    "confidenceHint": "中等置信度。完整精度作为可见的完整性检查显示。",
    "bayesianHint": "中等置信度。完整精度作为可见的完整性检查显示。",
    "rulesFired": "触发的规则",
    "rulesFiredHint": "仅列出实际触发的规则。",
    "recommendations": "建议",
    "recommendationsHint": "文本由推理引擎返回并保持不变地呈现。",
    "provenance": "推理来源",
    "reasoningProvenance": "推理来源",
    "retention": "保留",
    "retentionHint": "此结果仅保存在内存中。离开此屏幕将清除评估。不会写入设备存储。",
    "followUp": "随访",
    "biomarker": "生物标志物",
    "reasoningMode": "推理模式",
    "reasonerVersion": "推理引擎",
    "responseContract": "响应合同",
    "timestamp": "时间戳",
    "buildId": "构建 ID",
    "ontologySHA256": "本体 SHA-256",
    "tapToExpand": "点击展开"
  },
  "failClosed": {
    "title": "服务不可用",
    "subtitle": "基线验证失败",
    "heading": "评估被阻止",
    "blockedTitle": "评估被阻止",
    "message": "服务无法验证连接的推理引擎是否与已接受的基线匹配。在验证成功之前无法提交任何评估。",
    "blockedMessage": "服务无法验证连接的推理引擎是否与已接受的基线匹配。在验证成功之前无法提交任何评估。",
    "verificationDetail": "验证详情",
    "expectedReasoner": "预期推理引擎",
    "observedReasoner": "观察到推理引擎",
    "ontologyHash": "本体哈希",
    "notObserved": "未观察到",
    "observed": "已观察到",
    "lastSuccessfulCheck": "上次成功检查",
    "expectedValuesHint": "预期值来自已接受的基线清单；它们永远不会作为观察结果报告。",
    "verificationHint": "预期值来自已接受的基线清单；它们永远不会作为观察结果报告。",
    "sameTreatment": "不匹配时同样处理。重试仅重新运行验证 — 从不重新提交评估。",
    "retryCheck": "重试",
    "state": "状态"
  },
  "about": {
    "title": "关于",
    "subtitle": "构建和基线身份",
    "environment": "环境：评估",
    "appSection": "应用",
    "application": "应用",
    "marketingVersion": "营销版本",
    "nativeBuild": "原生构建",
    "easBuild": "EAS 构建 / 配置文件",
    "easBuildProfile": "EAS 构建 / 配置文件",
    "serviceSection": "服务",
    "service": "服务",
    "gateway": "网关",
    "reasoner": "推理引擎",
    "responseContractLabel": "响应合同",
    "responseContract": "响应合同",
    "reasoningModeLabel": "推理模式",
    "reasoningMode": "推理模式",
    "attestationSection": "基线认证",
    "baselineAttestation": "基线认证",
    "state": "状态",
    "lastVerified": "上次验证",
    "ontologyHashLabel": "本体 SHA-256（已观察，只读挂载）",
    "ontologySha256": "本体 SHA-256（已观察，只读挂载）",
    "dataHandlingSection": "数据处理",
    "dataHandling": "数据处理",
    "dataHandlingText": "不主动存储临床数据。无分析。第一波禁用崩溃报告。禁用无线更新 — 每次更改都需要新的已审查构建。",
    "unknownValue": "不可用"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "在 ACR 规则库中编写和升级的规则",
    "openlletDesc": "由 Openllet 推理引擎评估和验证的规则"
  },
  "errors": {
    "schemaInvalid": "输入格式无效。请检查您的输入。",
    "authRequired": "会话已过期。请重新启动应用并使用您的邀请码。",
    "attestationMismatch": "连接的推理引擎与已接受的基线不匹配。评估被阻止。",
    "attestationUnavailable": "无法验证推理引擎基线。请重试。",
    "serviceUnavailable": "服务暂时不可用。请稍后重试。",
    "indeterminate": "评估结果不确定。请勿自动重试 — 联系支持。",
    "rateLimited": "请求过多。请等待后重试。",
    "networkError": "网络连接失败。请检查连接后重试。"
  }
}
EOFzhCN
echo "  [14/16] src/locales/zh-CN.json"

# ─── 15. src/locales/ko-KR.json ───
backup_file "src/locales/ko-KR.json"
cat > src/locales/ko-KR.json << 'EOFkoKR'
{
  "app": {
    "name": "ACR",
    "tagline": "임상 의사결정 지원 · 컴패니언",
    "trialBanner": "연구 중 — 초청 평가 전용"
  },
  "common": {
    "cancel": "취소",
    "back": "뒤로",
    "next": "다음",
    "review": "검토",
    "submit": "제출",
    "edit": "편집",
    "done": "완료",
    "close": "닫기",
    "about": "정보",
    "retry": "다시 시도",
    "newAssessment": "새 평가",
    "required": "필수",
    "optional": "선택",
    "generated": "생성됨",
    "on": "켜짐",
    "off": "꺼짐",
    "verified": "확인됨",
    "unavailable": "사용 불가",
    "mismatch": "불일치",
    "yes": "예",
    "no": "아니요",
    "checking": "확인 중…",
    "emDash": "—",
    "negative": "음성",
    "positive": "양성",
    "retryCheck": "다시 시도"
  },
  "welcome": {
    "title": "시작하기 전에",
    "description1": "이 앱은 ACR-Platform 추론 엔진의 프레젠테이션 클라이언트입니다. 모든 추론은 서버 측에서 이루어집니다.",
    "description2": "합성 데이터만 사용하세요. 실제, 코딩되거나 가명화된 환자 정보를 입력하지 마십시오.",
    "description3": "의도적인 임상 데이터 저장이 없습니다. 입력은 한 번의 평가에 대해서만 메모리에 존재합니다.",
    "description4": "진단이나 치료를 위한 것이 아닙니다.",
    "beginButton": "이해했습니다 — 시작",
    "languageSelector": "언어"
  },
  "assessment": {
    "newTitle": "새 평가",
    "step1Subtitle": "5단계 중 1단계 · 수용체 상태",
    "step2Subtitle": "5단계 중 2단계 · 종양 특성",
    "step3Subtitle": "5단계 중 3단계 · 바이오마커 및 수술",
    "p1Subtitle": "5단계 중 4단계 · 임시 확장 P1",
    "p2Subtitle": "5단계 중 5단계 · 임시 확장 P2",
    "stepSubtitle": "{{total}}단계 중 {{current}}단계 · {{title}}",
    "reviewTitle": "검토",
    "reviewSubtitle": "제출 전 입력 내용을 확인하세요",
    "clinicalTransparency": "임상 투명성: 출력은 검증된 규칙 기반으로 생성된 의사결정 지원 자료에 불과합니다. 임상 판단은 임상의에게 있습니다.",
    "clinicalTransparencyBanner": "임상 투명성: 출력은 검증된 규칙 기반으로 생성된 의사결정 지원 자료에 불과합니다. 임상 판단은 임상의에게 있습니다."
  },
  "receptors": {
    "cardTitle": "수용체 상태",
    "stepTitle": "수용체 상태",
    "erStatus": "ER 상태",
    "prStatus": "PR 상태",
    "her2Status": "HER2 상태",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100. Luminal A < 14, Luminal B ≥ 14. 참고용 — 분류는 추론 엔진이 수행합니다.",
    "positive": "양성",
    "negative": "음성",
    "sessionId": "세션 ID",
    "sessionIdHint": "평가마다 새로운 UUIDv4. 절대 입력되지 않고, 재사용되지 않으며, 지속되지 않습니다.",
    "sessionLabel": "세션"
  },
  "tumour": {
    "cardTitle": "종양",
    "stepTitle": "종양 특성",
    "stage": "기",
    "stageHint": "고정된 API 계약 열거형에서 가져온 값 — 중복되는 별칭 없음.",
    "grade": "등급",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "조직학적 하위 유형",
    "histologyIDC": "IDC — 침윤성 관상피암",
    "histologyILC": "ILC — 침윤성 소엽암",
    "histologyDCIS": "DCIS — 관내암",
    "histologyPaget": "Paget 병",
    "nodalStatus": "림프절 상태",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "나이 (세)",
    "ageHint": "18–120, 전체 연도. 나이는 추론 엔진이 소비하는 유일한 인구통계학적 필드입니다."
  },
  "biomarkers": {
    "cardTitle": "혈청 마커",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "참조 임계값 35.0 — 평가는 서버 측에서 수행됩니다.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "참조 임계값 5.0 — 평가는 서버 측에서 수행됩니다.",
    "surgeryDate": "수술 날짜",
    "surgeryDateHint": "미래 날짜가 허용되며 변경 없이 제출됩니다: B3 가드는 추론 엔진의 책임이며 테스트 가능해야 합니다.",
    "surgeryCardTitle": "수술"
  },
  "markers": {
    "stepTitle": "바이오마커 및 수술",
    "serumMarkersTitle": "혈청 마커",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "참조 임계값 35.0 — 평가는 서버 측에서 수행됩니다.",
    "cea": "CEA (ng/mL)",
    "ceaHint": "참조 임계값 5.0 — 평가는 서버 측에서 수행됩니다.",
    "surgeryTitle": "수술",
    "surgeryDate": "수술 날짜",
    "surgeryDateHint": "미래 날짜가 허용되며 변경 없이 제출됩니다: B3 가드는 추론 엔진의 책임이며 테스트 가능해야 합니다."
  },
  "session": {
    "cardTitle": "세션",
    "sessionId": "세션 ID",
    "sessionIdHint": "평가마다 새로운 UUIDv4. 절대 입력되지 않고, 재사용되지 않으며, 지속되지 않습니다."
  },
  "p1": {
    "stepTitle": "임시 확장 P1 · 핵심 입력",
    "cardTitle": "확인이 필요한 핵심 입력",
    "tumorSize": "종양 크기",
    "tumorSizeHint": "0보다 큰 유한 숫자. 인터페이스 매핑 전 단위와 최대값을 확인해야 합니다.",
    "tumorSizeError": "0보다 큰 유한 숫자 값을 입력하세요.",
    "gender": "성별 / 추론 엔진이 사용하는 성별",
    "genderHint": "기본값 없음. 표시 문구와 전송 값은 확인이 필요합니다.",
    "genderError": "수락된 계약 enum을 사용할 수 없습니다. 어떤 값도 가정되지 않았습니다.",
    "nodalWarning": "림프절 매핑 보류 중: 현재 UI N0–N3은 양성/음성으로 자동 변환되지 않습니다.",
    "contractNote": "계약 참고: 값은 메모리에 남아 있으며 이 업데이트에서 API 요청에 매핑되지 않습니다.",
    "blockerTitle": "계약 차단기 — 입력 오류가 아님",
    "blockerText": "N0–N3 대 양성/음성 의미가 해결되지 않는 한 림프절 상태를 매핑할 수 없습니다."
  },
  "p2": {
    "stepTitle": "임시 확장 P2 · 결정 수정자",
    "performanceTitle": "성능 및 종양 생물학",
    "ecog": "ECOG 성능 상태",
    "ecogError": "0에서 4 사이의 정수 ECOG 점수를 입력하세요.",
    "pdl1": "PD-L1 상태",
    "her2Low": "HER2-low",
    "safetyTitle": "치료 안전성 및 의도",
    "lvef": "LVEF (%)",
    "lvefHint": "유한 백분율, 0–100 포함.",
    "lvefError": "0에서 100 사이의 유한 백분율을 입력하세요.",
    "treatmentIntent": "치료 의도",
    "optionalHint": "빈 선택적 값은 허용되며 null로 유지됩니다.",
    "ruleWarning": "규칙 종속성에 임상 및 실행 가능한 검토가 필요함"
  },
  "review": {
    "title": "검토",
    "subtitle": "제출 전 입력 내용을 확인하세요",
    "enteredValues": "입력된 값",
    "erPrHer2": "ER / PR / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "기 / 등급",
    "histology": "조직학",
    "nodalStatusLabel": "림프절 상태",
    "nodalStatus": "림프절 상태",
    "ageLabel": "나이",
    "age": "나이",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "수술 날짜",
    "surgeryDate": "수술 날짜",
    "reasoningOptions": "추론 옵션",
    "bayesianLayer": "베이지안 레이어",
    "bayesianHint": "요청 필드만 설정합니다. 장치에서 계산은 수행되지 않습니다.",
    "baseline": "기준선",
    "attestation": "인증",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · 온톨로지 해시가 수락된 기준 매니페스트와 일치합니다.",
    "checking": "확인 중…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · 온톨로지 해시가 수락된 기준 매니페스트와 일치합니다.",
    "submitBlocked": "인증이 확인될 때까지 제출이 차단됩니다.",
    "submissionFailed": "제출 실패",
    "provisionalP1": "임시 임상 검토 필드 — P1",
    "provisionalP2": "임시 임상 검토 필드 — P2",
    "tumorSize": "종양 크기",
    "genderReasoner": "성별 (추론 엔진)",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "치료 의도",
    "p1NotMapped": "API에 매핑되지 않음. 계약 확인 보류 중.",
    "p2RuleWarning": "선택적 수정자. 규칙 종속성에 임상 검토가 필요합니다."
  },
  "result": {
    "title": "평가 결과",
    "subtitle": "서버 측 추론 · 합성 프로필",
    "noResult": "사용 가능한 결과가 없습니다.",
    "newAssessment": "새 평가",
    "molecularSubtype": "분자 하위 유형",
    "bayesianConfidence": "베이지안 신뢰도",
    "confidenceHint": "중간 신뢰도. 전체 정밀도가 가시적인 무결성 검사로 표시됩니다.",
    "bayesianHint": "중간 신뢰도. 전체 정밀도가 가시적인 무결성 검사로 표시됩니다.",
    "rulesFired": "발동된 규칙",
    "rulesFiredHint": "실제로 발동된 규칙만 나엵니다.",
    "recommendations": "권장 사항",
    "recommendationsHint": "텍스트는 추론 엔진에서 반환되며 변경 없이 렌더링됩니다.",
    "provenance": "추론 출처",
    "reasoningProvenance": "추론 출처",
    "retention": "보존",
    "retentionHint": "이 결과는 메모리에만 보관됩니다. 이 화면을 떠나면 평가가 지워집니다. 장치 저장소에 아무것도 기록되지 않습니다.",
    "followUp": "후속 조치",
    "biomarker": "바이오마커",
    "reasoningMode": "추론 모드",
    "reasonerVersion": "추론 엔진",
    "responseContract": "응답 계약",
    "timestamp": "타임스탬프",
    "buildId": "빌드 ID",
    "ontologySHA256": "온톨로지 SHA-256",
    "tapToExpand": "탭하여 확장"
  },
  "failClosed": {
    "title": "서비스를 사용할 수 없음",
    "subtitle": "기준선 확인 실패",
    "heading": "평가 차단됨",
    "blockedTitle": "평가 차단됨",
    "message": "서비스에서 연결된 추론 엔진이 수락된 기준선과 일치하는지 확인할 수 없습니다. 확인이 성공할 때까지 평가를 제출할 수 없습니다.",
    "blockedMessage": "서비스에서 연결된 추론 엔진이 수락된 기준선과 일치하는지 확인할 수 없습니다. 확인이 성공할 때까지 평가를 제출할 수 없습니다.",
    "verificationDetail": "확인 세부 정보",
    "expectedReasoner": "예상 추론 엔진",
    "observedReasoner": "관찰된 추론 엔진",
    "ontologyHash": "온톨로지 해시",
    "notObserved": "관찰되지 않음",
    "observed": "관찰됨",
    "lastSuccessfulCheck": "마지막 성공 확인",
    "expectedValuesHint": "예상 값은 수락된 기준 매니페스트에서 가져옵니다. 관찰 결과로 보고되지 않습니다.",
    "verificationHint": "예상 값은 수락된 기준 매니페스트에서 가져옵니다. 관찰 결과로 보고되지 않습니다.",
    "sameTreatment": "불일치 시 동일 처리. 재시도는 확인만 다시 실행 — 평가를 다시 제출하지 않습니다.",
    "retryCheck": "다시 시도",
    "state": "상태"
  },
  "about": {
    "title": "정보",
    "subtitle": "빌드 및 기준선 ID",
    "environment": "환경: 평가",
    "appSection": "애플리케이션",
    "application": "애플리케이션",
    "marketingVersion": "마케팅 버전",
    "nativeBuild": "네이티브 빌드",
    "easBuild": "EAS 빌드 / 프로필",
    "easBuildProfile": "EAS 빌드 / 프로필",
    "serviceSection": "서비스",
    "service": "서비스",
    "gateway": "게이트웨이",
    "reasoner": "추론 엔진",
    "responseContractLabel": "응답 계약",
    "responseContract": "응답 계약",
    "reasoningModeLabel": "추론 모드",
    "reasoningMode": "추론 모드",
    "attestationSection": "기준선 인증",
    "baselineAttestation": "기준선 인증",
    "state": "상태",
    "lastVerified": "마지막 확인",
    "ontologyHashLabel": "온톨로지 SHA-256 (관찰됨, 읽기 전용 마운트)",
    "ontologySha256": "온톨로지 SHA-256 (관찰됨, 읽기 전용 마운트)",
    "dataHandlingSection": "데이터 처리",
    "dataHandling": "데이터 처리",
    "dataHandlingText": "의도적인 임상 데이터 저장이 없습니다. 분석 없음. 1차 웨이브용 충돌 보고 비활성화. OTA 업데이트 비활성화 — 모든 변경 사항은 새로 검토된 빌드가 필요합니다.",
    "unknownValue": "사용 불가"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "ACR 규칙 기반 내에서 작성 및 승격된 규칙",
    "openlletDesc": "Openllet 추론 엔진에 의해 평가 및 검증된 규칙"
  },
  "errors": {
    "schemaInvalid": "잘못된 입력 형식입니다. 입력 내용을 확인하세요.",
    "authRequired": "세션이 만료되었습니다. 앱을 다시 시작하고 초대 코드를 사용하세요.",
    "attestationMismatch": "연결된 추론 엔진이 수락된 기준선과 일치하지 않습니다. 평가가 차단되었습니다.",
    "attestationUnavailable": "추론 엔진 기준선을 확인할 수 없습니다. 다시 시도하세요.",
    "serviceUnavailable": "서비스를 일시적으로 사용할 수 없습니다. 나중에 다시 시도하세요.",
    "indeterminate": "평가 결과가 불확실합니다. 자동으로 다시 시도하지 마세요 — 지원팀에 문의하세요.",
    "rateLimited": "요청이 너무 많습니다. 다시 시도하기 전에 잠시 기다리세요.",
    "networkError": "네트워크 연결에 실패했습니다. 연결을 확인하고 다시 시도하세요."
  }
}
EOFkoKR
echo "  [15/16] src/locales/ko-KR.json"

# ─── 16. src/locales/ja-JP.json ───
backup_file "src/locales/ja-JP.json"
cat > src/locales/ja-JP.json << 'EOFjaJP'
{
  "app": {
    "name": "ACR",
    "tagline": "臨床意思決定支援 · コンパニオン",
    "trialBanner": "研究中 — 招待評価のみ"
  },
  "common": {
    "cancel": "キャンセル",
    "back": "戻る",
    "next": "次へ",
    "review": "確認",
    "submit": "送信",
    "edit": "編集",
    "done": "完了",
    "close": "閉じる",
    "about": "情報",
    "retry": "再試行",
    "newAssessment": "新規評価",
    "required": "必須",
    "optional": "任意",
    "generated": "生成済み",
    "on": "ON",
    "off": "OFF",
    "verified": "検証済み",
    "unavailable": "利用不可",
    "mismatch": "不一致",
    "yes": "はい",
    "no": "いいえ",
    "checking": "確認中…",
    "emDash": "—",
    "negative": "陰性",
    "positive": "陽性",
    "retryCheck": "再試行"
  },
  "welcome": {
    "title": "開始する前に",
    "description1": "このアプリはACR-Platform推論エンジンのプレゼンテーションクライアントです。すべての推論はサーバー側で行われます。",
    "description2": "合成データのみ。実在の、コード化された、または仮名化された患者情報を入力しないでください。",
    "description3": "意図的な臨床データの保存はありません。入力は1回の評価のみメモリに存在します。",
    "description4": "診断や治療を目的としたものではありません。",
    "beginButton": "理解しました — 開始",
    "languageSelector": "言語"
  },
  "assessment": {
    "newTitle": "新規評価",
    "step1Subtitle": "ステップ 1 / 5 · 受容体状態",
    "step2Subtitle": "ステップ 2 / 5 · 腫瘍特性",
    "step3Subtitle": "ステップ 3 / 5 · バイオマーカーと手術",
    "p1Subtitle": "ステップ 4 / 5 · 暫定拡張 P1",
    "p2Subtitle": "ステップ 5 / 5 · 暫定拡張 P2",
    "stepSubtitle": "ステップ {{current}} / {{total}} · {{title}}",
    "reviewTitle": "確認",
    "reviewSubtitle": "送信前に入力内容を確認してください",
    "clinicalTransparency": "臨床透明性：出力は検証済みのルールベースによって生成された意思決定支援のみです。臨床判断は臨床医にあります。",
    "clinicalTransparencyBanner": "臨床透明性：出力は検証済みのルールベースによって生成された意思決定支援のみです。臨床判断は臨床医にあります。"
  },
  "receptors": {
    "cardTitle": "受容体状態",
    "stepTitle": "受容体状態",
    "erStatus": "ER状態",
    "prStatus": "PR状態",
    "her2Status": "HER2状態",
    "ki67": "Ki-67 (%)",
    "ki67Hint": "0–100。Luminal A < 14、Luminal B ≥ 14。参考のみ — 分類は推論エンジンが実行します。",
    "positive": "陽性",
    "negative": "陰性",
    "sessionId": "セッションID",
    "sessionIdHint": "評価ごとに新しいUUIDv4。入力されず、再利用されず、永続化されません。",
    "sessionLabel": "セッション"
  },
  "tumour": {
    "cardTitle": "腫瘍",
    "stepTitle": "腫瘍特性",
    "stage": "病期",
    "stageHint": "固定されたAPI契約列挙型からの値 — 重複するエイリアスなし。",
    "grade": "グレード",
    "grade1": "1",
    "grade2": "2",
    "grade3": "3",
    "histologicalSubtype": "組織学的亜型",
    "histologyIDC": "IDC — 浸潤性管癌",
    "histologyILC": "ILC — 浸潤性小葉癌",
    "histologyDCIS": "DCIS — 管状原位癌",
    "histologyPaget": "Paget病",
    "nodalStatus": "リンパ節状態",
    "nodalN0": "N0",
    "nodalN1": "N1",
    "nodalN2": "N2",
    "nodalN3": "N3",
    "age": "年齢（歳）",
    "ageHint": "18–120、満年齢。年齢は推論エンジンが消費する唯一の人口統計フィールドです。"
  },
  "biomarkers": {
    "cardTitle": "血清マーカー",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "基準閾値 35.0 — 評価はサーバー側で実行されます。",
    "cea": "CEA (ng/mL)",
    "ceaHint": "基準閾値 5.0 — 評価はサーバー側で実行されます。",
    "surgeryDate": "手術日",
    "surgeryDateHint": "未来日付が許可され、変更されずに送信されます：B3ガードは推論エンジンの責任であり、テスト可能である必要があります。",
    "surgeryCardTitle": "手術"
  },
  "markers": {
    "stepTitle": "バイオマーカーと手術",
    "serumMarkersTitle": "血清マーカー",
    "ca153": "CA 15-3 (U/mL)",
    "ca153Hint": "基準閾値 35.0 — 評価はサーバー側で実行されます。",
    "cea": "CEA (ng/mL)",
    "ceaHint": "基準閾値 5.0 — 評価はサーバー側で実行されます。",
    "surgeryTitle": "手術",
    "surgeryDate": "手術日",
    "surgeryDateHint": "未来日付が許可され、変更されずに送信されます：B3ガードは推論エンジンの責任であり、テスト可能である必要があります。"
  },
  "session": {
    "cardTitle": "セッション",
    "sessionId": "セッションID",
    "sessionIdHint": "評価ごとに新しいUUIDv4。入力されず、再利用されず、永続化されません。"
  },
  "p1": {
    "stepTitle": "暫定拡張 P1 · コア入力",
    "cardTitle": "確認が必要なコア入力",
    "tumorSize": "腫瘍サイズ",
    "tumorSizeHint": "ゼロより大きい有限数。インターフェースマッピングの前に単位と最大値を確認する必要があります。",
    "tumorSizeError": "ゼロより大きい有限の数値を入力してください。",
    "gender": "性別 / 推論エンジンが使用する性別",
    "genderHint": "デフォルトなし。表示文言とワイヤー値は確認が必要です。",
    "genderError": "受け入れられたコントラクトenumは利用できませんでした。値は想定されていません。",
    "nodalWarning": "リンパ節マッピング保留中：現在のUI N0–N3は陽性/陰性に自動変換されません。",
    "contractNote": "契約メモ：値はメモリに残り、この更新ではAPIリクエストにマッピングされません。",
    "blockerTitle": "契約ブロッカー — 入力エラーではありません",
    "blockerText": "N0–N3対陽性/陰性のセマンティクスが解決されるまで、リンパ節ステータスはマッピングできません。"
  },
  "p2": {
    "stepTitle": "暫定拡張 P2 · 決定修飾子",
    "performanceTitle": "パフォーマンスと腫瘍生物学",
    "ecog": "ECOGパフォーマンスステータス",
    "ecogError": "0から4までの整数ECOGスコアを入力してください。",
    "pdl1": "PD-L1ステータス",
    "her2Low": "HER2-low",
    "safetyTitle": "治療の安全性と意図",
    "lvef": "LVEF (%)",
    "lvefHint": "有限パーセンテージ、0–100を含む。",
    "lvefError": "0から100までの有限パーセンテージを入力してください。",
    "treatmentIntent": "治療意図",
    "optionalHint": "空のオプション値は受け入れられ、nullのままです。",
    "ruleWarning": "ルール依存関係には臨床および実行可能なレビューが必要です"
  },
  "review": {
    "title": "確認",
    "subtitle": "送信前に入力内容を確認してください",
    "enteredValues": "入力された値",
    "erPrHer2": "ER / PR / HER2",
    "ki67Label": "Ki-67",
    "ki67": "Ki-67",
    "stageGrade": "病期 / グレード",
    "histology": "組織学",
    "nodalStatusLabel": "リンパ節状態",
    "nodalStatus": "リンパ節状態",
    "ageLabel": "年齢",
    "age": "年齢",
    "ca153Cea": "CA 15-3 / CEA",
    "surgeryDateLabel": "手術日",
    "surgeryDate": "手術日",
    "reasoningOptions": "推論オプション",
    "bayesianLayer": "ベイジアンレイヤー",
    "bayesianHint": "リクエストフィールドのみ設定します。デバイス上での計算は行われません。",
    "baseline": "ベースライン",
    "attestation": "アテステーション",
    "attestationHint": "Reasoner v2.2.1 · OPENLLET_SWRL · オントロジーハッシュが受け入れられたベースラインマニフェストと一致します。",
    "checking": "確認中…",
    "baselineHint": "Reasoner v2.2.1 · OPENLLET_SWRL · オントロジーハッシュが受け入れられたベースラインマニフェストと一致します。",
    "submitBlocked": "アテステーションが検証済みでない限り、送信はブロックされます。",
    "submissionFailed": "送信に失敗しました",
    "provisionalP1": "暫定的な臨床レビューフィールド — P1",
    "provisionalP2": "暫定的な臨床レビューフィールド — P2",
    "tumorSize": "腫瘍サイズ",
    "genderReasoner": "性別（推論エンジン）",
    "ecog": "ECOG",
    "pdl1": "PD-L1",
    "her2Low": "HER2-low",
    "lvef": "LVEF",
    "treatmentIntent": "治療意図",
    "p1NotMapped": "APIにマッピングされていません。契約確認保留中。",
    "p2RuleWarning": "オプションの修飾子。ルール依存関係には臨床レビューが必要です。"
  },
  "result": {
    "title": "評価結果",
    "subtitle": "サーバー側推論 · 合成プロファイル",
    "noResult": "結果はありません。",
    "newAssessment": "新規評価",
    "molecularSubtype": "分子亜型",
    "bayesianConfidence": "ベイジアン信頼度",
    "confidenceHint": "中程度の信頼度。完全な精度は可視的な整合性チェックとして表示されます。",
    "bayesianHint": "中程度の信頼度。完全な精度は可視的な整合性チェックとして表示されます。",
    "rulesFired": "発火したルール",
    "rulesFiredHint": "実際に発火したルールのみがリストされます。",
    "recommendations": "推奨事項",
    "recommendationsHint": "テキストは推論エンジンによって返され、変更なしでレンダリングされます。",
    "provenance": "推論の出典",
    "reasoningProvenance": "推論の出典",
    "retention": "保持",
    "retentionHint": "この結果はメモリのみに保持されます。この画面を離れると評価がクリアされます。デバイスストレージには何も書き込まれません。",
    "followUp": "フォローアップ",
    "biomarker": "バイオマーカー",
    "reasoningMode": "推論モード",
    "reasonerVersion": "推論エンジン",
    "responseContract": "レスポンスコントラクト",
    "timestamp": "タイムスタンプ",
    "buildId": "ビルドID",
    "ontologySHA256": "オントロジーSHA-256",
    "tapToExpand": "タップして展開"
  },
  "failClosed": {
    "title": "サービス利用不可",
    "subtitle": "ベースライン検証に失敗しました",
    "heading": "評価がブロックされました",
    "blockedTitle": "評価がブロックされました",
    "message": "サービスは、接続された推論エンジンが受け入れられたベースラインと一致することを確認できませんでした。検証が成功するまで評価を送信することはできません。",
    "blockedMessage": "サービスは、接続された推論エンジンが受け入れられたベースラインと一致することを確認できませんでした。検証が成功するまで評価を送信することはできません。",
    "verificationDetail": "検証の詳細",
    "expectedReasoner": "期待される推論エンジン",
    "observedReasoner": "観察された推論エンジン",
    "ontologyHash": "オントロジーハッシュ",
    "notObserved": "未観察",
    "observed": "観察済み",
    "lastSuccessfulCheck": "最後の成功したチェック",
    "expectedValuesHint": "期待値は受け入れられたベースラインマニフェストから取得されます。観測結果として報告されることはありません。",
    "verificationHint": "期待値は受け入れられたベースラインマニフェストから取得されます。観測結果として報告されることはありません。",
    "sameTreatment": "不一致の場合も同様の扱い。再試行は検証のみを再実行 — 評価を再送信することはありません。",
    "retryCheck": "再試行",
    "state": "状態"
  },
  "about": {
    "title": "情報",
    "subtitle": "ビルドおよびベースラインID",
    "environment": "環境：評価",
    "appSection": "アプリケーション",
    "application": "アプリケーション",
    "marketingVersion": "マーケティングバージョン",
    "nativeBuild": "ネイティブビルド",
    "easBuild": "EASビルド / プロファイル",
    "easBuildProfile": "EASビルド / プロファイル",
    "serviceSection": "サービス",
    "service": "サービス",
    "gateway": "ゲートウェイ",
    "reasoner": "推論エンジン",
    "responseContractLabel": "レスポンスコントラクト",
    "responseContract": "レスポンスコントラクト",
    "reasoningModeLabel": "推論モード",
    "reasoningMode": "推論モード",
    "attestationSection": "ベースラインアテステーション",
    "baselineAttestation": "ベースラインアテステーション",
    "state": "状態",
    "lastVerified": "最終検証",
    "ontologyHashLabel": "オントロジーSHA-256（観測済み、読み取り専用マウント）",
    "ontologySha256": "オントロジーSHA-256（観測済み、読み取り専用マウント）",
    "dataHandlingSection": "データ処理",
    "dataHandling": "データ処理",
    "dataHandlingText": "意図的な臨床データの保存はありません。分析なし。ウェーブ1のクラッシュレポートは無効。OTAアップデートは無効 — すべての変更には新しいレビュー済みビルドが必要です。",
    "unknownValue": "利用不可"
  },
  "provenance": {
    "acrNative": "ACR_NATIVE",
    "openlletVerified": "OPENLLET_NATIVE_VERIFIED",
    "acrNativeDesc": "ACRルールベース内で作成および昇格されたルール",
    "openlletDesc": "Openllet推論エンジンによって評価および検証されたルール"
  },
  "errors": {
    "schemaInvalid": "無効な入力形式です。入力内容を確認してください。",
    "authRequired": "セッションが期限切れです。アプリを再起動し、招待コードを使用してください。",
    "attestationMismatch": "接続された推論エンジンが受け入れられたベースラインと一致しません。評価がブロックされました。",
    "attestationUnavailable": "推論エンジンのベースラインを検証できませんでした。再試行してください。",
    "serviceUnavailable": "サービスが一時的に利用できません。後でもう一度お試しください。",
    "indeterminate": "評価結果が不確定です。自動的に再試行しないでください — サポートにお問い合わせください。",
    "rateLimited": "リクエストが多すぎます。再試行する前にお待ちください。",
    "networkError": "ネットワーク接続に失敗しました。接続を確認して再試行してください。"
  }
}
EOFjaJP
echo "  [16/16] src/locales/ja-JP.json"


echo ""
echo "=============================="
echo "All 16 files updated successfully."
echo "Backup saved to: ${BACKUP_DIR}"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Stage: git add src/"
echo "  3. Commit via GitHub Desktop"
echo "=============================="
