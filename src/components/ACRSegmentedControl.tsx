import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACRColors, ACRTypography } from '../theme/colors';
import { getLocaleDirection, getTextAlign, isRTL } from '../utils/rtl';

interface Props {
  options: string[];
  labels?: string[];
  selected: string;
  onSelect: (value: string) => void;
  /** Build 47: a selected background for particular options (e.g. demo mode in amber). */
  selectedColors?: Partial<Record<string, string>>;
}

export const ACRSegmentedControl: React.FC<Props> = ({ options, labels, selected, onSelect, selectedColors }) => {
  const { i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const direction = getLocaleDirection(activeLanguage);
  const textAlign = getTextAlign(activeLanguage);
  const isRtl = isRTL(activeLanguage);

  return (
    <View accessibilityRole="radiogroup" style={[styles.container, { direction }]}>
      {options.map((opt, idx) => (
        <TouchableOpacity
          key={opt}
          accessibilityRole="radio"
          accessibilityLabel={labels ? labels[idx] : opt}
          accessibilityState={{ selected: selected === opt }}
          style={[
            styles.segment,
            selected === opt && styles.selected,
            selected === opt && selectedColors?.[opt] ? { backgroundColor: selectedColors[opt] } : null,
            idx < options.length - 1 && (isRtl ? styles.borderLeft : styles.borderRight),
          ]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.text,
              { writingDirection: direction, textAlign },
              selected === opt && styles.selectedText,
            ]}
          >
            {labels?.[idx] || opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

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
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: ACRColors.line,
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
