import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';
import type { VerificationState } from '../types/api';

interface Props {
  state: VerificationState;
}

/**
 * The words a screen reader speaks for a state. A badge inside an accessible
 * row is not announced on its own — the row's label is — so every row that
 * shows a badge passes this as its spoken value (Build 46 accessibility fix).
 */
export const spokenState = (state: VerificationState): string => state.replace(/_/g, ' ').toLowerCase();

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
