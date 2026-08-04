import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';

interface Props {
  text: string;
  variant?: 'warning' | 'trial';
}

export const ACRBanner: React.FC<Props> = ({ text, variant = 'warning' }) => {
  const isWarning = variant === 'warning';
  return (
    <View style={[styles.container, isWarning ? styles.warning : styles.trial]}>
      <Text style={[styles.text, isWarning ? styles.warningText : styles.trialText]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    flex: 0,
  },
  warning: {
    backgroundColor: ACRColors.warningBg,
    borderLeftWidth: 3,
    borderLeftColor: ACRColors.warningBorder,
  },
  trial: {
    backgroundColor: ACRColors.trialBg,
    borderLeftWidth: 3,
    borderLeftColor: ACRColors.trialBorder,
    paddingVertical: 5,
  },
  text: {
    fontSize: 9.5,
    lineHeight: 13,
  },
  warningText: {
    color: ACRColors.warningText,
  },
  trialText: {
    color: ACRColors.trialText,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontSize: 9,
  },
});
