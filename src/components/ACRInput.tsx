import React, { useId } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, TextInput, Text, View, StyleSheet } from 'react-native';
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
  /** Accessible name for the field. Falls back to the placeholder or hint. */
  accessibilityLabel?: string;
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
  accessibilityLabel,
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const direction = getLocaleDirection(language);
  const textAlign = getTextAlign(language);
  // Build 47 (Kraken, iPhone 13 test, 16 Sept 2026): the keyboard gives way once
  // a value is entered. iOS number pads have no return key, so they get a Done
  // bar; on Android the keyboard's own Done/Enter key closes it.
  const accessoryId = `acr-input-${useId()}`;
  const needsDoneBar = Platform.OS === 'ios' && keyboardType !== 'default' && editable && !readOnly;
  return (
    <View style={{ direction }}>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? placeholder ?? hint}
        accessibilityHint={hint}
        accessibilityState={{ disabled: !(editable && !readOnly) }}
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
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={() => Keyboard.dismiss()}
        inputAccessoryViewID={needsDoneBar ? accessoryId : undefined}
      />
      {needsDoneBar ? <InputAccessoryView nativeID={accessoryId}>
        <View style={styles.doneBar}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('common:done')} onPress={() => Keyboard.dismiss()} hitSlop={10}>
            <Text style={styles.doneText}>{t('common:done')}</Text>
          </Pressable>
        </View>
      </InputAccessoryView> : null}
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
  doneBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#f1f3f5',
    borderTopWidth: 1,
    borderTopColor: ACRColors.line,
  },
  doneText: { fontSize: 15, fontWeight: '700', color: ACRColors.primary },
});
