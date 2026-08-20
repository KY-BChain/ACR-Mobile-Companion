import React from 'react';
import { Text, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { useAssessmentStore, type ProvisionalGender } from '../store/assessmentStore';
import { isTumorSizeValid } from '../utils/provisionalValidation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const P1Screen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { p1, setP1 } = useAssessmentStore();
  const tumorSizeValid = isTumorSizeValid(p1.tumorSize);
  const genderOptions: ProvisionalGender[] = ['', 'female', 'male', 'other', 'unknown'];
  const genderLabels = [t('common:emDash'), t('p1:female'), t('p1:male'), t('p1:other'), t('p1:unknown')];

  return (
    <ScreenLayout
      title={t('p1:title')}
      subtitle={t('assessment:stepSubtitle', { current: 4, total: 5, title: t('p1:stepTitle') })}
      bannerText={t('p1:banner')}
      steps={{ total: 5, current: 4 }}
      footer={<>
        <ACRButton title={t('common:back')} variant="secondary" onPress={() => navigation.goBack()} />
        <ACRButton title={t('common:next')} variant="primary" disabled={!tumorSizeValid} onPress={() => navigation.navigate('P2')} />
      </>}
    >
      <ACRCard title={t('p1:cardTitle')}>
        <Text style={styles.label}>{t('p1:tumorSize')} <Text style={styles.small}>· {t('common:optional')}</Text></Text>
        <ACRInput value={p1.tumorSize} onChangeText={(value) => setP1({ tumorSize: value })} keyboardType="numeric" hint={t('p1:tumorSizeHint')} />
        {!tumorSizeValid ? <Text accessibilityRole="alert" style={styles.error}>{t('p1:tumorSizeError')}</Text> : null}
        <Text style={styles.label}>{t('p1:gender')} <Text style={styles.small}>· {t('common:optional')}</Text></Text>
        <ACRSegmentedControl options={genderOptions} labels={genderLabels} selected={p1.gender} onSelect={(value) => setP1({ gender: value as ProvisionalGender })} />
        {!p1.gender ? <Text style={styles.hint}>{t('p1:genderPending')}</Text> : null}
      </ACRCard>
      <ACRCard title={t('p1:nodalWarningTitle')}><Text style={styles.hint}>{t('p1:nodalWarning')}</Text></ACRCard>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  label: { ...ACRTypography.label, marginTop: 9, marginBottom: 4, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
  small: { fontWeight: '400', color: ACRColors.muted },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 5, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
  error: { ...ACRTypography.hint, color: ACRColors.stopBorder, marginTop: 4 },
});