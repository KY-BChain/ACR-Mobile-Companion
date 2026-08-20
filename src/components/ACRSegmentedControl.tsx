import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';

interface Props {
  options: string[];
  labels?: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export const ACRSegmentedControl: React.FC<Props> = ({ options, labels, selected, onSelect }) => (
  <View style={styles.container}>
    {options.map((opt, idx) => (
      <TouchableOpacity
        key={opt}
        style={[
          styles.segment,
          selected === opt && styles.selected,
          idx < options.length - 1 && styles.borderRight,
        ]}
        onPress={() => onSelect(opt)}
        activeOpacity={0.9}
      >
        <Text style={[styles.text, selected === opt && styles.selectedText]}>{labels?.[idx] || opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1.4,
    borderColor: ACRColors.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selected: {
    backgroundColor: ACRColors.primary,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: ACRColors.line,
  },
  text: {
    ...ACRTypography.body,
    color: ACRColors.primary,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
