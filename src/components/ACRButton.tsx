import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRButtonStyle, ACRTypography } from '../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface Props {
  title: string;
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
}

export const ACRButton: React.FC<Props> = ({ title, variant = 'primary', onPress, disabled }) => {
  const styleMap = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
  };
  const textMap = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
  };

  return (
    <TouchableOpacity
      style={[styles.base, styleMap[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, textMap[variant]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  primary: {
    backgroundColor: ACRColors.primary,
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1.4,
    borderColor: ACRColors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.4,
    borderColor: ACRColors.line,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...ACRTypography.button,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: ACRColors.primary,
  },
  ghostText: {
    color: ACRColors.muted,
  },
});
