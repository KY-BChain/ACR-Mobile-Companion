import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { ACRColors } from '../theme/colors';
import { ACRHeader } from './ACRHeader';
import { ACRBanner } from './ACRBanner';
import { ACRStepIndicator } from './ACRStepIndicator';

interface Props {
  title: string;
  subtitle?: string;
  bannerText?: string;
  bannerVariant?: 'warning' | 'trial';
  steps?: { total: number; current: number };
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ScreenLayout: React.FC<Props> = ({
  title,
  subtitle,
  bannerText,
  bannerVariant = 'warning',
  steps,
  children,
  footer,
}) => (
  <SafeAreaView style={styles.safe}>
    <View style={styles.island} />
    <ACRHeader title={title} subtitle={subtitle} />
    {bannerText ? <ACRBanner text={bannerText} variant={bannerVariant} /> : null}
    {steps ? <ACRStepIndicator total={steps.total} current={steps.current} /> : null}
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      {children}
    </ScrollView>
    {footer ? <View style={styles.footer}>{footer}</View> : null}
  </SafeAreaView>
);

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
