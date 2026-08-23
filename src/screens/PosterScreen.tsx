import React, { useMemo, useRef } from 'react';
import {
  Image,
  PanResponder,
  StyleSheet,
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

const POSTER_ASPECT_RATIO = 1536 / 1024;
const SWIPE_CAPTURE_DISTANCE = 12;
const SWIPE_NAVIGATION_DISTANCE = 40;

const POSTERS: Record<PosterLocale, ImageSourcePropType> = {
  en: require('../assets/posters/ACR_PLATFORM_One_Page_Intro_EN_v1.1_76SWRL.png'),
  fr: require('../assets/posters/ACR_PLATFORM_One_Page_Intro_FR_v1.1_76SWRL.png'),
  'zh-CN': require('../assets/posters/ACR_PLATFORM_One_Page_Intro_ZH-CN_v1.1_76SWRL.png'),
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const PosterScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const navigationInProgress = useRef(false);

  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const poster = POSTERS[getPosterLocale(activeLanguage)];
  const availableHeight = Math.max(1, height - insets.top - insets.bottom);
  const posterWidth = Math.min(width, availableHeight / POSTER_ASPECT_RATIO);
  const posterHeight = posterWidth * POSTER_ASPECT_RATIO;

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gestureState) => (
        gestureState.dy < -SWIPE_CAPTURE_DISTANCE
        && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
      ),
      onPanResponderRelease: (_event, gestureState) => {
        if (gestureState.dy <= -SWIPE_NAVIGATION_DISTANCE && !navigationInProgress.current) {
          navigationInProgress.current = true;
          navigation.replace('Welcome');
        }
      },
      onPanResponderTerminate: () => {
        navigationInProgress.current = false;
      },
    }),
    [navigation],
  );

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      {...panResponder.panHandlers}
    >
      <Image
        source={poster}
        style={{ width: posterWidth, height: posterHeight }}
        resizeMode="contain"
        accessible
        accessibilityLabel="ACR Platform introduction poster"
      />
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
});
