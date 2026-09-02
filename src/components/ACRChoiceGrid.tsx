import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACRColors, ACRTypography } from '../theme/colors';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';

interface Props<T extends string> { options: readonly T[]; labels?: readonly string[]; selected: T | null; onSelect: (value: T) => void }

export function ACRChoiceGrid<T extends string>({ options, labels, selected, onSelect }: Props<T>) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  return (
    <View style={[styles.grid, { direction: getLocaleDirection(language) }]}>
      {options.map((option, index) => (
        <TouchableOpacity key={option} style={[styles.choice, selected === option && styles.selected]} onPress={() => onSelect(option)}>
          <Text style={[styles.text, { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) }, selected === option && styles.selectedText]}>
            {labels?.[index] ?? option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  choice: { minWidth: 50, paddingVertical: 7, paddingHorizontal: 9, borderWidth: 1.2, borderColor: ACRColors.primary, borderRadius: 8, backgroundColor: '#fff' },
  selected: { backgroundColor: ACRColors.primary },
  text: { ...ACRTypography.body, color: ACRColors.primary },
  selectedText: { color: '#fff', fontWeight: '600' },
});
