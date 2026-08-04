import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRCardStyle, ACRTypography } from '../theme/colors';

interface Props {
  title?: string;
  children: React.ReactNode;
}

export const ACRCard: React.FC<Props> = ({ title, children }) => (
  <View style={styles.card}>
    {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    ...ACRCardStyle,
  },
  cardTitle: {
    ...ACRTypography.cardTitle,
    color: ACRColors.primary,
    marginBottom: 9,
  },
});
