import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ACRBanner } from '../components/ACRBanner';
import { ACRButton } from '../components/ACRButton';
import { ScreenLayout } from '../components/ScreenLayout';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  return (
    <ScreenLayout
      title="ACR"
      subtitle="Clinical Decision Support · Companion"
      bannerText="INVESTIGATIONAL — INVITED EVALUATION ONLY"
      bannerVariant="trial"
    >
      <View style={styles.center}>
        <Text style={styles.logo}>ACR</Text>
        <Text style={styles.tag}>Clinical Decision Support · Companion</Text>

        <View style={styles.consentBox}>
          <Text style={styles.consentTitle}>Before you begin</Text>
          <Text style={styles.consentText}>
            {"This app is a presentation client for the ACR-Platform reasoner. All reasoning happens server-side.\n\n"}
            <Text style={styles.bold}>Synthetic data only.</Text>
            {" Do not enter live, coded or pseudonymised patient information.\n\n"}
            <Text style={styles.bold}>No intentional clinical data at rest.</Text>
            {" Entries exist in memory for one assessment only.\n\nNot for diagnosis or treatment."}
          </Text>
        </View>
      </View>

      <View style={styles.btnRow}>
        <ACRButton title="About" variant="ghost" onPress={() => navigation.navigate('About')} />
        <ACRButton
          title="I understand — Begin"
          variant="primary"
          onPress={() => navigation.navigate('Step1')}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logo: {
    ...ACRTypography.logo,
    color: ACRColors.primary,
    marginBottom: 5,
  },
  tag: {
    ...ACRTypography.body,
    color: ACRColors.muted,
    marginBottom: 18,
  },
  consentBox: {
    backgroundColor: ACRColors.card,
    borderWidth: 1,
    borderColor: ACRColors.line,
    borderRadius: 10,
    padding: 11,
    width: '100%',
  },
  consentTitle: {
    ...ACRTypography.label,
    color: ACRColors.primaryDark,
    marginBottom: 6,
  },
  consentText: {
    fontSize: 10.5,
    lineHeight: 16,
    color: ACRColors.ink,
  },
  bold: {
    fontWeight: '700',
    color: ACRColors.primaryDark,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    paddingHorizontal: 13,
    paddingBottom: 16,
  },
});
