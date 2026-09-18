import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getPosterLocale, type PosterLocale } from '../utils/posterLocale';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { ACRButton } from '../components/ACRButton';
import { ACRColors, ACRTypography } from '../theme/colors';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';

const POSTER_ASPECT_RATIO = 1536 / 1024;
const SWIPE_CAPTURE_DISTANCE = 12;
// The poster and the privacy notice turn into each other every few seconds, as
// Welcome turns to the poster (Kraken, 18 September 2026). Any swipe, or opening
// the manual, stops the rotation and leaves the reader in control.
const PAGE_TURN_MS = 6000;
const SWIPE_NAVIGATION_DISTANCE = 40;

const POSTERS: Record<PosterLocale, ImageSourcePropType> = {
  en: require('../assets/posters/ACR_PLATFORM_One_Page_Intro_EN_v1.1_76SWRL.png'),
  fr: require('../assets/posters/ACR_PLATFORM_One_Page_Intro_FR_v1.1_76SWRL.png'),
  'zh-CN': require('../assets/posters/ACR_PLATFORM_One_Page_Intro_ZH-CN_v1.1_76SWRL.png'),
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Two pages: the introduction poster, and the short privacy and cookies notice
 * (Kraken, 17 September 2026). They turn into each other every few seconds until
 * the reader takes over. Sideways swipes move between them; an upward swipe
 * continues to Welcome from either page.
 */
export const PosterScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const navigationInProgress = useRef(false);
  const [page, setPage] = useState<0 | 1>(0);
  const pageRef = useRef<0 | 1>(0);
  const turnedByHand = useRef(false);

  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const poster = POSTERS[getPosterLocale(activeLanguage)];
  const availableHeight = Math.max(1, height - insets.top - insets.bottom);
  const posterWidth = Math.min(width, availableHeight / POSTER_ASPECT_RATIO);
  const posterHeight = posterWidth * POSTER_ASPECT_RATIO;
  const localText = {
    writingDirection: getLocaleDirection(activeLanguage),
    textAlign: getTextAlign(activeLanguage),
  };

  const showPage = useCallback((next: 0 | 1, byHand = true) => {
    if (byHand) turnedByHand.current = true;
    pageRef.current = next;
    setPage(next);
  }, []);

  useEffect(() => {
    if (turnedByHand.current) return undefined;
    const timer = setTimeout(() => {
      if (!turnedByHand.current) showPage(page === 0 ? 1 : 0, false);
    }, PAGE_TURN_MS);
    return () => clearTimeout(timer);
  }, [page, showPage]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gestureState) => (
        (gestureState.dy < -SWIPE_CAPTURE_DISTANCE && Math.abs(gestureState.dy) > Math.abs(gestureState.dx))
        || (Math.abs(gestureState.dx) > SWIPE_CAPTURE_DISTANCE && Math.abs(gestureState.dx) > Math.abs(gestureState.dy))
      ),
      onPanResponderRelease: (_event, gestureState) => {
        if (gestureState.dy <= -SWIPE_NAVIGATION_DISTANCE && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          if (navigationInProgress.current) return;
          navigationInProgress.current = true;
          navigation.replace('Welcome');
          return;
        }
        if (Math.abs(gestureState.dx) >= SWIPE_NAVIGATION_DISTANCE) {
          showPage(pageRef.current === 0 ? 1 : 0);
        }
      },
      onPanResponderTerminate: () => {
        navigationInProgress.current = false;
      },
    }),
    [navigation, showPage],
  );

  return (
    <View
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      {...panResponder.panHandlers}
    >
      {page === 0 ? (
        <Image
          source={poster}
          style={{ width: posterWidth, height: posterHeight }}
          resizeMode="contain"
          accessible
          accessibilityLabel="ACR Platform introduction poster"
        />
      ) : (
        <View style={styles.noticePage}>
          <ScrollView
            style={styles.noticeScroll}
            contentContainerStyle={styles.noticeContent}
            keyboardShouldPersistTaps="handled"
          >
            <PrivacyNotice />
          </ScrollView>
          <ACRButton
            title={t('legal:readDetails')}
            variant="primary"
            compact
            onPress={() => {
              turnedByHand.current = true;   // reading the manual stops the rotation
              navigation.navigate('Manual', { section: 'legal' });
            }}
          />
          <Text style={[styles.hint, localText]}>{t('legal:swipeHint')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  noticePage: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  noticeScroll: {
    flex: 1,
  },
  noticeContent: {
    paddingBottom: 10,
  },
  hint: {
    ...ACRTypography.hint,
    color: ACRColors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
});
