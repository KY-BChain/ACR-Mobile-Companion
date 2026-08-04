import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { ACRColors, ACRTypography } from '../theme/colors';

interface Props {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
  editable?: boolean;
  hint?: string;
  readOnly?: boolean;
}

export const ACRInput: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  hint,
  readOnly = false,
}) => (
  <View>
    <TextInput
      style={[styles.input, readOnly && styles.readOnly]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      editable={editable && !readOnly}
      placeholderTextColor={ACRColors.muted}
    />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  input: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderWidth: 1.4,
    borderColor: ACRColors.line,
    borderRadius: 8,
    fontSize: 13,
    backgroundColor: '#fff',
    color: ACRColors.ink,
  },
  readOnly: {
    backgroundColor: '#f4f6f8',
    color: ACRColors.muted,
    fontFamily: 'ui-monospace, Menlo, monospace',
    fontSize: 10.5,
  },
  hint: {
    ...ACRTypography.hint,
    color: ACRColors.muted,
    marginTop: 3,
  },
});
