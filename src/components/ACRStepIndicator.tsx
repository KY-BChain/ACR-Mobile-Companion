import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ACRColors } from '../theme/colors';

interface Props {
  total: number;
  current: number;
}

export const ACRStepIndicator: React.FC<Props> = ({ total, current }) => (
  <View style={styles.container}>
    {Array.from({ length: total }).map((_, idx) => (
      <View key={idx} style={[styles.dot, idx < current && styles.active]} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: ACRColors.line,
  },
  active: {
    backgroundColor: ACRColors.teal,
  },
});
