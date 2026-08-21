import React, { useRef, useState } from 'react';
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
import { getLocaleDirection, getTextAlign, isRTL } from '../utils/rtl';

const LOGO_CORNERSTONE = require('../assets/logos/logo-cornerstone.png');
const LOGO_BLOCKENERGY = require('../assets/logos/logo-blockenergy.png');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const languageChangeInProgress = useRef(false);

  const currentLang = i18n.language as LanguageCode;
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const direction = getLocaleDirection(activeLanguage);
  const textAlign = getTextAlign(activeLanguage);
  const isRtl = isRTL(activeLanguage);
  const localeTextStyle = { writingDirection: direction, textAlign };
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  const handleSelectLanguage = async (code: LanguageCode) => {
    if (languageChangeInProgress.current) {
      return;
    }

    languageChangeInProgress.current = true;
    setLangModalVisible(false);

    try {
      if (code !== currentLang) {
        await changeLanguage(code);
      }
    } catch (error) {
      console.error('Language change failed', error);
    } finally {
      languageChangeInProgress.current = false;
    }
  };

  return (
    <View style={[styles.root, { direction }]}>
      <ScreenLayout
        title={t('app:name')}
        subtitle={t('app:tagline')}
        bannerText={t('app:trialBanner')}
        bannerVariant="trial"
      >
        <View style={styles.center}>
          <Text style={[styles.logo, localeTextStyle]}>{t('app:name')}</Text>
          <Text style={[styles.tag, localeTextStyle]}>{t('app:tagline')}</Text>

          <View style={styles.consentBox}>
            <Text style={[styles.consentTitle, localeTextStyle]}>{t('welcome:title')}</Text>
            <Text style={[styles.consentText, localeTextStyle]}>
              {t('welcome:description1')}
              {'\n\n'}
              {t('welcome:description2')}
              {'\n\n'}
              {t('welcome:description3')}
              {'\n\n'}
              {t('welcome:description4')}
            </Text>
          </View>
        </View>

        {/* ─── Language selector ─── */}
        <TouchableOpacity
          style={styles.langSelector}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={t('welcome:languageSelector')}
        >
          <View style={styles.langRow}>
            <Text style={[styles.langLabel, localeTextStyle]}>{t('welcome:languageSelector')}</Text>
            <Text style={[styles.langValue, localeTextStyle]}>
              {currentLangMeta?.flag}  {currentLangMeta?.name}
            </Text>
          </View>
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

      <Image
        source={LOGO_CORNERSTONE}
        style={[
          styles.logoTop,
          isRtl ? styles.logoTopLeft : styles.logoTopRight,
          { top: insets.top + 10 },
        ]}
        resizeMode="contain"
        accessibilityLabel="Corner Stone International Foundation"
      />

      <Image
        source={LOGO_BLOCKENERGY}
        style={[
          styles.logoBottom,
          isRtl ? styles.logoBottomRight : styles.logoBottomLeft,
          { bottom: insets.bottom + 10 },
        ]}
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
            <Text style={[styles.modalTitle, localeTextStyle]}>{t('welcome:languageSelector')}</Text>

            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const selected = item.code === currentLang;
                return (
                  <TouchableOpacity
                    style={[styles.langItem, selected && styles.langItemSelected]}
                    onPress={() => { void handleSelectLanguage(item.code); }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.langItemFlag,
                        isRtl ? styles.langItemFlagRtl : styles.langItemFlagLtr,
                      ]}
                    >
                      {item.flag}
                    </Text>
                    <Text
                      style={[
                        styles.langItemName,
                        selected && styles.langItemNameSelected,
                        {
                          writingDirection: getLocaleDirection(item.code),
                          textAlign: getTextAlign(item.code),
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selected && (
                      <Text
                        style={[
                          styles.checkmark,
                          isRtl ? styles.checkmarkRtl : styles.checkmarkLtr,
                        ]}
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    isRtl ? styles.separatorRtl : styles.separatorLtr,
                  ]}
                />
              )}
            />

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setLangModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCloseText, localeTextStyle]}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    paddingHorizontal: 13,
    paddingBottom: 16,
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ACRColors.card,
    borderWidth: 1.5,
    borderColor: ACRColors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 13,
    marginBottom: 10,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
  logoTop: {
    position: 'absolute',
    width: 70,
    height: 28,
    zIndex: 10,
  },
  logoTopRight: {
    right: 14,
  },
  logoTopLeft: {
    left: 14,
  },
  logoBottom: {
    position: 'absolute',
    width: 100,
    height: 32,
    zIndex: 10,
  },
  logoBottomLeft: {
    left: 16,
  },
  logoBottomRight: {
    right: 16,
  },
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
  },
  langItemFlagLtr: {
    marginRight: 12,
  },
  langItemFlagRtl: {
    marginLeft: 12,
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
  },
  checkmarkLtr: {
    marginLeft: 8,
  },
  checkmarkRtl: {
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: ACRColors.line,
  },
  separatorLtr: {
    marginLeft: 42,
  },
  separatorRtl: {
    marginRight: 42,
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
