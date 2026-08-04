import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';
import type { Provenance } from '../types/api';

interface Props {
  provenance: Provenance;
}

export const ACRBadge: React.FC<Props> = ({ provenance }) => {
  const isNative = provenance === 'ACR_NATIVE';
  return (
    <View style={[styles.badge, { backgroundColor: isNative ? ACRColors.native : ACRColors.verified }]}>
      <Text style={styles.text}>{provenance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  text: {
    ...ACRTypography.badge,
    color: '#fff',
  },
});
