import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { form, setStep2 } = useAssessmentStore();

  // Grade options: data values remain '1'|'2'|'3', labels are translatable if needed.
  const gradeOptions = [
    { value: '1', label: t('tumour:grade1') },
    { value: '2', label: t('tumour:grade2') },
    { value: '3', label: t('tumour:grade3') },
  ];

  const nodalOptions = [
    { value: 'N0', label: t('tumour:nodalN0') },
    { value: 'N1', label: t('tumour:nodalN1') },
    { value: 'N2', label: t('tumour:nodalN2') },
    { value: 'N3', label: t('tumour:nodalN3') },
  ];

  return (
    <ScreenLayout
      title={t('assessment:newTitle')}
      subtitle={t('assessment:stepSubtitle', { current: 2, total: 3, title: t('tumour:stepTitle') })}
      bannerText={t('assessment:clinicalTransparencyBanner')}
      steps={{ total: 3, current: 2 }}
      footer={
        <>
          <ACRButton title={t('common:back')} variant="secondary" onPress={() => navigation.goBack()} />
          <ACRButton title={t('common:next')} variant="primary" onPress={() => navigation.navigate('Step3')} />
        </>
      }
    >
      <ACRCard title={t('tumour:cardTitle')}>
        <Label text={t('tumour:stage')} optional />
        <View style={styles.pickerShell}>
          <Text style={styles.pickerText}>{form.step2.stage || '—'}</Text>
        </View>
        <Text style={styles.hint}>{t('tumour:stageHint')}</Text>

        <Label text={t('tumour:grade')} optional />
        <ACRSegmentedControl
          options={gradeOptions.map((o) => o.value)}
          labels={gradeOptions.map((o) => o.label)}
          selected={form.step2.grade || ''}
          onSelect={(v) => setStep2({ grade: v as '1' | '2' | '3' })}
        />

        <Label text={t('tumour:histologicalSubtype')} optional />
        <View style={styles.pickerShell}>
          <Text style={styles.pickerText}>{form.step2.histologicalSubtype || '—'}</Text>
        </View>

        <Label text={t('tumour:nodalStatus')} optional />
        <ACRSegmentedControl
          options={nodalOptions.map((o) => o.value)}
          labels={nodalOptions.map((o) => o.label)}
          selected={form.step2.nodalStatus || ''}
          onSelect={(v) => setStep2({ nodalStatus: v as 'N0' | 'N1' | 'N2' | 'N3' })}
        />

        <Label text={t('tumour:age')} optional />
        <ACRInput
          value={form.step2.age}
          onChangeText={(text) => setStep2({ age: text })}
          keyboardType="numeric"
          hint={t('tumour:ageHint')}
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
  pickerShell: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderWidth: 1.4,
    borderColor: ACRColors.line,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 13,
    color: ACRColors.ink,
  },
  hint: {
    ...ACRTypography.hint,
    color: ACRColors.muted,
    marginTop: 3,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
