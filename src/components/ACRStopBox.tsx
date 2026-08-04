import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';

interface Props {
  title: string;
  message: string;
}

export const ACRStopBox: React.FC<Props> = ({ title, message }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: ACRColors.stopBg,
    borderWidth: 1.5,
    borderColor: ACRColors.stopBorder,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  title: {
    ...ACRTypography.stopTitle,
    color: ACRColors.stopBorder,
    marginBottom: 6,
  },
  message: {
    ...ACRTypography.stopBody,
    color: ACRColors.stopText,
    textAlign: 'center',
  },
});
