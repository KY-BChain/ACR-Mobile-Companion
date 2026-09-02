import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { WalkthroughNotice } from '../components/WalkthroughNotice';
import { useAssessmentStore } from '../store/assessmentStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';
import { isIsoDateValid, isMarkerValid } from '../utils/provisionalValidation';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const Step3MarkersScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { form, setStep3 } = useAssessmentStore();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  const markersValid = isMarkerValid(form.step3.ca153) && isMarkerValid(form.step3.cea);
  const dateValid = isIsoDateValid(form.step3.surgeryDate);
  const isValid = markersValid && dateValid;

  return (
    <ScreenLayout
      title={t('assessment:newTitle')}
      subtitle={t('assessment:stepSubtitle', { current: 3, total: 5, title: t('markers:stepTitle') })}
      bannerText={t('assessment:clinicalTransparencyBanner')}
      steps={{ total: 5, current: 3 }}
      footer={
        <>
          <ACRButton title={t('common:back')} variant="secondary" onPress={() => navigation.goBack()} />
          <ACRButton title={t('common:next')} variant="primary" disabled={!isValid} onPress={() => navigation.navigate('P1')} />
        </>
      }
    >
      <WalkthroughNotice />
      <ACRCard title={t('markers:serumMarkersTitle')}>
        <Label text={t('markers:ca153')} optional />
        <ACRInput
          value={form.step3.ca153}
          onChangeText={(text) => setStep3({ ca153: text })}
          keyboardType="numeric"
          hint={t('markers:ca153Hint')}
        />
        {!isMarkerValid(form.step3.ca153) ? <Text style={[styles.error, localText]}>{t('build44:markerError')}</Text> : null}

        <Label text={t('markers:cea')} optional />
        <ACRInput
          value={form.step3.cea}
          onChangeText={(text) => setStep3({ cea: text })}
          keyboardType="numeric"
          hint={t('markers:ceaHint')}
        />
        {!isMarkerValid(form.step3.cea) ? <Text style={[styles.error, localText]}>{t('build44:markerError')}</Text> : null}
      </ACRCard>

      <ACRCard title={t('markers:surgeryTitle')}>
        <Label text={t('markers:surgeryDate')} optional />
        <ACRInput
          value={form.step3.surgeryDate}
          onChangeText={(text) => setStep3({ surgeryDate: text })}
          hint={t('markers:surgeryDateHint')}
        />
        {!dateValid ? <Text style={[styles.error, localText]}>{t('build44:dateError')}</Text> : null}
      </ACRCard>

      <ACRCard title={t('build44:bayesian')}>
        <ACRSegmentedControl
          options={['on', 'off']}
          labels={[t('common:on'), t('common:off')]}
          selected={form.step3.bayesianEnhanced ? 'on' : 'off'}
          onSelect={(value) => setStep3({ bayesianEnhanced: value === 'on' })}
        />
      </ACRCard>
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; optional?: boolean }> = ({ text, optional }) => {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  return (
    <Text
      style={[
        styles.label,
        {
          writingDirection: getLocaleDirection(activeLanguage),
          textAlign: getTextAlign(activeLanguage),
        },
      ]}
    >
      {text} {optional ? <Text style={styles.small}>· {t('common:optional')}</Text> : null}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    ...ACRTypography.label,
    marginTop: 9,
    marginBottom: 4,
  },
  small: {
    fontWeight: '400',
    color: ACRColors.muted,
  },
  error: { ...ACRTypography.hint, color: ACRColors.stopBorder, marginTop: 4 },
});
