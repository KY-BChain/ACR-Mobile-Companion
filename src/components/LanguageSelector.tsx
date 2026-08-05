import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage, LanguageCode } from '../i18n/config';
import { colors } from '../theme/colors';

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={i18n.language as LanguageCode}
        onValueChange={(itemValue: LanguageCode) => changeLanguage(itemValue)}
        style={styles.picker}
        dropdownIconColor={colors.acr}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Picker.Item
            key={lang.code}
            label={`${lang.flag} ${lang.name}`}
            value={lang.code}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  picker: {
    color: colors.ink,
  },
});