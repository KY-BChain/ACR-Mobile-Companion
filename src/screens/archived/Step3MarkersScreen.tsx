import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { form, setStep3 } = useAssessmentStore();

  return (
    <ScreenLayout
      title={t('assessment:newTitle')}
      subtitle={t('assessment:stepSubtitle', { current: 3, total: 3, title: t('markers:stepTitle') })}
      bannerText={t('assessment:clinicalTransparencyBanner')}
      steps={{ total: 3, current: 3 }}
      footer={
        <>
          <ACRButton title={t('common:back')} variant="secondary" onPress={() => navigation.goBack()} />
          <ACRButton title={t('common:review')} variant="primary" onPress={() => navigation.navigate('Review')} />
        </>
      }
    >
      <ACRCard title={t('markers:serumMarkersTitle')}>
        <Label text={t('markers:ca153')} optional />
        <ACRInput
          value={form.step3.ca153}
          onChangeText={(text) => setStep3({ ca153: text })}
          keyboardType="numeric"
          hint={t('markers:ca153Hint')}
        />

        <Label text={t('markers:cea')} optional />
        <ACRInput
          value={form.step3.cea}
          onChangeText={(text) => setStep3({ cea: text })}
          keyboardType="numeric"
          hint={t('markers:ceaHint')}
        />
      </ACRCard>

      <ACRCard title={t('markers:surgeryTitle')}>
        <Label text={t('markers:surgeryDate')} optional />
        <ACRInput
          value={form.step3.surgeryDate}
          onChangeText={(text) => setStep3({ surgeryDate: text })}
          hint={t('markers:surgeryDateHint')}
        />
      </ACRCard>
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; optional?: boolean }> = ({ text, optional }) => {
  const { t } = useTranslation();
  return (
    <Text style={styles.label}>
      {text} {optional ? <Text style={styles.small}>· {t('common:optional')}</Text> : null}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    ...ACRTypography.label,
    marginTop: 9,
    marginBottom: 4,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  small: {
    fontWeight: '400',
    color: ACRColors.muted,
  },
});
