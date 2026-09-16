import React from 'react';
import { KeyboardAvoidingView, Platform, View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACRColors } from '../theme/colors';
import { getLocaleDirection } from '../utils/rtl';
import { ACRHeader } from './ACRHeader';
import { ACRBanner } from './ACRBanner';
import { ACRStepIndicator } from './ACRStepIndicator';

interface Props {
  title: string;
  subtitle?: string;
  titleStyle?: object;
  bannerText?: string;
  bannerVariant?: 'warning' | 'trial';
  steps?: { total: number; current: number };
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ScreenLayout: React.FC<Props> = ({
  title,
  subtitle,
  titleStyle,
  bannerText,
  bannerVariant = 'warning',
  steps,
  children,
  footer,
}) => {
  const { i18n } = useTranslation();
  const direction = getLocaleDirection(i18n.resolvedLanguage ?? i18n.language);

  return (
    <SafeAreaView style={[styles.safe, { direction }]}>
      <View style={styles.island} />
      <ACRHeader title={title} subtitle={subtitle} titleStyle={titleStyle} />
      {bannerText ? <ACRBanner text={bannerText} variant={bannerVariant} /> : null}
      {steps ? <ACRStepIndicator total={steps.total} current={steps.current} /> : null}
      {/* Build 47: the footer (Next / Review) rises above the keyboard on iOS; a
          tap on it works while the keyboard is open, and dragging the page closes
          the keyboard. */}
      <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ACRColors.background,
  },
  island: {
    height: 26,
    backgroundColor: '#1b1b1d',
    width: 104,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignSelf: 'center',
  },
  keyboardArea: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 13,
    paddingTop: 12,
  },
  bodyContent: {
    paddingBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    paddingHorizontal: 13,
    paddingBottom: 16,
    backgroundColor: ACRColors.background,
  },
});
