import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';
import type { VerificationState } from '../types/api';

interface Props {
  state: VerificationState;
}

export const ACRStateBadge: React.FC<Props> = ({ state }) => {
  const isVerified = state === 'VERIFIED';
  return (
    <View style={[styles.badge, { borderColor: isVerified ? ACRColors.verifiedState : ACRColors.unavailableState }]}>
      <Text style={[styles.text, { color: isVerified ? ACRColors.verifiedState : ACRColors.unavailableState }]}>
        {state}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
    borderWidth: 1.2,
  },
  text: {
    ...ACRTypography.stateBadge,
  },
});
