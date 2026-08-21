import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ScreenLayout } from '../components/ScreenLayout';
import { ACRCard } from '../components/ACRCard';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { ACRInput } from '../components/ACRInput';
import { ACRButton } from '../components/ACRButton';
import { useAssessmentStore, type ProvisionalHer2Low, type ProvisionalStatus, type TreatmentIntent } from '../store/assessmentStore';
import { isEcogValid, isLvefValid } from '../utils/provisionalValidation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const P2Screen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { p2, setP2 } = useAssessmentStore();
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const localeTextStyle = {
    writingDirection: getLocaleDirection(activeLanguage),
    textAlign: getTextAlign(activeLanguage),
  };
  const ecogValid = isEcogValid(p2.ecogScore);
  const lvefValid = isLvefValid(p2.lvef);
  const empty = t('common:emDash');
  const statusOptions: ProvisionalStatus[] = ['', 'positive', 'negative', 'not_tested'];
  const statusLabels = [empty, t('common:positive'), t('common:negative'), t('p2:notTested')];
  const her2Options: ProvisionalHer2Low[] = ['', 'positive', 'negative', 'unknown'];
  const her2Labels = [empty, t('common:positive'), t('common:negative'), t('p2:unknown')];
  const intentOptions: TreatmentIntent[] = ['', 'neoadjuvant', 'adjuvant', 'unspecified'];
  const intentLabels = [empty, t('p2:neoadjuvant'), t('p2:adjuvant'), t('p2:unspecified')];
  const goToReview = () => {
    if (ecogValid && lvefValid) navigation.navigate('Review');
  };

  return (
    <ScreenLayout title={t('p2:title')} subtitle={t('assessment:stepSubtitle', { current: 5, total: 5, title: t('p2:stepTitle') })} bannerText={t('p2:banner')} steps={{ total: 5, current: 5 }} footer={<>
      <ACRButton title={t('common:back')} variant="secondary" onPress={() => navigation.goBack()} />
      <ACRButton title={t('common:review')} variant="primary" disabled={!ecogValid || !lvefValid} onPress={goToReview} />
    </>}>
      <ACRCard title={t('p2:cardTitle')}>
        <Text style={[styles.label, localeTextStyle]}>{t('p2:ecogScore')} <Text style={styles.small}>· {t('common:optional')}</Text></Text>
        <ACRInput value={p2.ecogScore} onChangeText={(value) => setP2({ ecogScore: value })} keyboardType="numeric" hint={t('p2:ecogHint')} />
        {!ecogValid ? <Text accessibilityRole="alert" style={[styles.error, localeTextStyle]}>{t('p2:ecogError')}</Text> : null}
        <Text style={[styles.label, localeTextStyle]}>{t('p2:pdl1Status')} <Text style={styles.small}>· {t('common:optional')}</Text></Text>
        <ACRSegmentedControl options={statusOptions} labels={statusLabels} selected={p2.pdl1Status} onSelect={(value) => setP2({ pdl1Status: value as ProvisionalStatus })} />
        <Text style={[styles.label, localeTextStyle]}>{t('p2:her2Low')} <Text style={styles.small}>· {t('common:optional')}</Text></Text>
        <ACRSegmentedControl options={her2Options} labels={her2Labels} selected={p2.her2Low} onSelect={(value) => setP2({ her2Low: value as ProvisionalHer2Low })} />
        <Text style={[styles.label, localeTextStyle]}>{t('p2:lvef')} <Text style={styles.small}>· {t('common:optional')}</Text></Text>
        <ACRInput value={p2.lvef} onChangeText={(value) => setP2({ lvef: value })} keyboardType="numeric" hint={t('p2:lvefHint')} />
        {!lvefValid ? <Text accessibilityRole="alert" style={[styles.error, localeTextStyle]}>{t('p2:lvefError')}</Text> : null}
        <Text style={[styles.label, localeTextStyle]}>{t('p2:treatmentIntent')} <Text style={styles.small}>· {t('common:optional')}</Text></Text>
        <ACRSegmentedControl options={intentOptions} labels={intentLabels} selected={p2.treatmentIntent} onSelect={(value) => setP2({ treatmentIntent: value as TreatmentIntent })} />
      </ACRCard>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  label: { ...ACRTypography.label, marginTop: 9, marginBottom: 4 },
  small: { fontWeight: '400', color: ACRColors.muted },
  error: { ...ACRTypography.hint, color: ACRColors.stopBorder, marginTop: 4 },
});
