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
import { generatePatientId } from '../utils/uuid';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const Step1ReceptorsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { form, setStep1, sessionId, setSessionId } = useAssessmentStore();

  React.useEffect(() => {
    if (!sessionId) {
      setSessionId(generatePatientId());
    }
  }, [sessionId, setSessionId]);

  const isValid = form.step1.ki67 !== '' && !isNaN(Number(form.step1.ki67));

  // Data values stay 'positive' | 'negative' for the store / rule engine.
  // Display labels are translated for UI rendering.
  const receptorOptions: Array<{ value: 'positive' | 'negative'; label: string }> = [
    { value: 'positive', label: t('common:positive') },
    { value: 'negative', label: t('common:negative') },
  ];

  return (
    <ScreenLayout
      title={t('assessment:newTitle')}
      subtitle={t('assessment:stepSubtitle', { current: 1, total: 3, title: t('receptors:stepTitle') })}
      bannerText={t('assessment:clinicalTransparencyBanner')}
      steps={{ total: 3, current: 1 }}
      footer={
        <>
          <ACRButton title={t('common:cancel')} variant="secondary" onPress={() => navigation.navigate('Welcome')} />
          <ACRButton
            title={t('common:next')}
            variant="primary"
            disabled={!isValid}
            onPress={() => navigation.navigate('Step2')}
          />
        </>
      }
    >
      <ACRCard title={t('receptors:cardTitle')}>
        <Label text={t('receptors:erStatus')} required />
        <ACRSegmentedControl
          options={receptorOptions.map((o) => o.value)}
          labels={receptorOptions.map((o) => o.label)}
          selected={form.step1.erStatus}
          onSelect={(v) => setStep1({ erStatus: v as 'positive' | 'negative' })}
        />

        <Label text={t('receptors:prStatus')} required />
        <ACRSegmentedControl
          options={receptorOptions.map((o) => o.value)}
          labels={receptorOptions.map((o) => o.label)}
          selected={form.step1.prStatus}
          onSelect={(v) => setStep1({ prStatus: v as 'positive' | 'negative' })}
        />

        <Label text={t('receptors:her2Status')} required />
        <ACRSegmentedControl
          options={receptorOptions.map((o) => o.value)}
          labels={receptorOptions.map((o) => o.label)}
          selected={form.step1.her2Status}
          onSelect={(v) => setStep1({ her2Status: v as 'positive' | 'negative' })}
        />

        <Label text={t('receptors:ki67')} required />
        <ACRInput
          value={form.step1.ki67}
          onChangeText={(text) => setStep1({ ki67: text })}
          keyboardType="numeric"
          hint={t('receptors:ki67Hint')}
        />
      </ACRCard>

      <ACRCard title={t('session:cardTitle')}>
        <Label text={t('session:sessionId')} generated />
        <ACRInput value={sessionId} readOnly hint={t('session:sessionIdHint')} />
      </ACRCard>
    </ScreenLayout>
  );
};

const Label: React.FC<{ text: string; required?: boolean; generated?: boolean }> = ({
  text,
  required,
  generated,
}) => {
  const { t } = useTranslation();
  return (
    <Text style={styles.label}>
      {text}{' '}
      {required ? <Text style={styles.small}>· {t('common:required')}</Text> : null}
      {generated ? <Text style={styles.small}>· {t('common:generated')}</Text> : null}
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
