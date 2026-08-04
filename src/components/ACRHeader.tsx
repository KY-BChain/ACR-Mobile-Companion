import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';

interface Props {
  title: string;
  subtitle?: string;
}

export const ACRHeader: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: ACRColors.primary,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  title: {
    ...ACRTypography.headerTitle,
    color: '#fff',
  },
  sub: {
    ...ACRTypography.headerSub,
    color: '#fff',
    marginTop: 1,
  },
});
