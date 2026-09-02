import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACRColors, ACRTypography } from '../theme/colors';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';

interface Props {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
  editable?: boolean;
  hint?: string;
  readOnly?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const ACRInput: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  hint,
  readOnly = false,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}) => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const direction = getLocaleDirection(language);
  const textAlign = getTextAlign(language);
  return (
    <View style={{ direction }}>
      <TextInput
        style={[styles.input, { direction, textAlign }, readOnly && styles.readOnly]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        editable={editable && !readOnly}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholderTextColor={ACRColors.muted}
      />
      {hint ? <Text style={[styles.hint, { direction, textAlign }]}>{hint}</Text> : null}
    </View>
  );
};

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
