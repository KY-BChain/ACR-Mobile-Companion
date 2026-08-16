import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACRColors, ACRTypography } from '../theme/colors';
import { ACRButton } from '../components/ACRButton';
import { ScreenLayout } from '../components/ScreenLayout';
import {
  SUPPORTED_LANGUAGES,
  changeLanguage,
  type LanguageCode,
} from '../i18n/config';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

// ─── Corporate logos ───
// Place these files in: src/assets/logos/ (or your preferred assets path)
const LOGO_CORNERSTONE = require('../../assets/logos/logo-cornerstone.png');
const LOGO_BLOCKENERGY = require('../../assets/logos/logo-blockenergy.png');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLang = i18n.language as LanguageCode;
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  const handleSelectLanguage = async (code: LanguageCode) => {
    if (code !== currentLang) {
      await changeLanguage(code);
      // NOTE: For full RTL layout switch (Arabic), an app restart is required.
      // In production, use: import * as Updates from 'expo-updates'; await Updates.reloadAsync();
    }
    setLangModalVisible(false);
  };

  return (
    <View style={styles.root}>
      <ScreenLayout
        title={t('app:name')}
        subtitle={t('app:tagline')}
        bannerText={t('app:trialBanner')}
        bannerVariant="trial"
      >
        <View style={styles.center}>
          <Text style={styles.logo}>{t('app:name')}</Text>
          <Text style={styles.tag}>{t('app:tagline')}</Text>

          <View style={styles.consentBox}>
            <Text style={styles.consentTitle}>{t('welcome:title')}</Text>
            <Text style={styles.consentText}>
              {t('welcome:description1')}
              {"\n\n"}
              {t('welcome:description2')}
              {"\n\n"}
              {t('welcome:description3')}
              {"\n\n"}
              {t('welcome:description4')}
            </Text>
          </View>
        </View>

        {/* ─── Language selector ─── */}
        <TouchableOpacity
          style={styles.langSelector}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('welcome:languageSelector')}
        >
          <Text style={styles.langLabel}>{t('welcome:languageSelector')}</Text>
          <Text style={styles.langValue}>
            {currentLangMeta?.flag}  {currentLangMeta?.name}
          </Text>
        </TouchableOpacity>

        {/* ─── Action buttons ─── */}
        <View style={styles.btnRow}>
          <ACRButton
            title={t('common:about')}
            variant="ghost"
            onPress={() => navigation.navigate('About')}
          />
          <ACRButton
            title={t('welcome:beginButton')}
            variant="primary"
            onPress={() => navigation.navigate('Step1')}
          />
        </View>
      </ScreenLayout>

      {/* ─── Top-right logo: Corner Stone International Foundation ───
          Positioned absolutely over the ScreenLayout header area.
          Adjust `top` value if your ScreenLayout header height differs. */}
      <Image
        source={LOGO_CORNERSTONE}
        style={[styles.logoTopRight, { top: insets.top + 10 }]}
        resizeMode="contain"
        accessibilityLabel="Corner Stone International Foundation"
      />

      {/* ─── Bottom-left logo: Block Energy (WelcomeScreen ONLY) ─── */}
      <Image
        source={LOGO_BLOCKENERGY}
        style={[styles.logoBottomLeft, { bottom: insets.bottom + 10 }]}
        resizeMode="contain"
        accessibilityLabel="Block Energy"
      />

      {/* ─── Language Selection Modal ─── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: Math.min(width * 0.85, 360) }]}>
            <Text style={styles.modalTitle}>{t('welcome:languageSelector')}</Text>

            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const selected = item.code === currentLang;
                return (
                  <TouchableOpacity
                    style={[styles.langItem, selected && styles.langItemSelected]}
                    onPress={() => handleSelectLanguage(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langItemFlag}>{item.flag}</Text>
                    <Text
                      style={[
                        styles.langItemName,
                        selected && styles.langItemNameSelected,
                        item.rtl && { textAlign: 'right' },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setLangModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // ─── Existing styles (preserved) ───
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logo: {
    ...ACRTypography.logo,
    color: ACRColors.primary,
    marginBottom: 5,
  },
  tag: {
    ...ACRTypography.body,
    color: ACRColors.muted,
    marginBottom: 18,
  },
  consentBox: {
    backgroundColor: ACRColors.card,
    borderWidth: 1,
    borderColor: ACRColors.line,
    borderRadius: 10,
    padding: 11,
    width: '100%',
  },
  consentTitle: {
    ...ACRTypography.label,
    color: ACRColors.primaryDark,
    marginBottom: 6,
  },
  consentText: {
    fontSize: 10.5,
    lineHeight: 16,
    color: ACRColors.ink,
  },
  bold: {
    fontWeight: '700',
    color: ACRColors.primaryDark,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    paddingHorizontal: 13,
    paddingBottom: 16,
  },

  // ─── Language selector (new) ───
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ACRColors.card,
    borderWidth: 1,
    borderColor: ACRColors.line,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 13,
    marginBottom: 10,
  },
  langLabel: {
    ...ACRTypography.label,
    color: ACRColors.muted,
    fontSize: 12,
  },
  langValue: {
    ...ACRTypography.body,
    color: ACRColors.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  // ─── Logo positioning (new) ───
  logoTopRight: {
    position: 'absolute',
    right: 14,
    width: 90,
    height: 36,
    zIndex: 10,
  },
  logoBottomLeft: {
    position: 'absolute',
    left: 16,
    width: 140,
    height: 45,
    zIndex: 10,
  },

  // ─── Modal styles (new) ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: ACRColors.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: ACRColors.line,
  },
  modalTitle: {
    ...ACRTypography.label,
    color: ACRColors.primaryDark,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  langItemSelected: {
    backgroundColor: ACRColors.line,
  },
  langItemFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  langItemName: {
    ...ACRTypography.body,
    color: ACRColors.ink,
    fontSize: 14,
    flex: 1,
  },
  langItemNameSelected: {
    color: ACRColors.primary,
    fontWeight: '700',
  },
  checkmark: {
    color: ACRColors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: ACRColors.line,
    marginLeft: 42,
  },
  modalCloseBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ACRColors.line,
  },
  modalCloseText: {
    ...ACRTypography.body,
    color: ACRColors.muted,
    fontSize: 14,
  },
});
