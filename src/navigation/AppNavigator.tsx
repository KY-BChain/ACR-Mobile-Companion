import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { PosterScreen } from '../screens/PosterScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { GatewayAccessScreen } from '../screens/GatewayAccessScreen';
import { Step1ReceptorsScreen } from '../screens/Step1ReceptorsScreen';
import { Step2TumourScreen } from '../screens/Step2TumourScreen';
import { Step3MarkersScreen } from '../screens/Step3MarkersScreen';
import { P1Screen } from '../screens/P1Screen';
import { P2Screen } from '../screens/P2Screen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { FailClosedScreen } from '../screens/FailClosedScreen';
import { ManualScreen } from '../screens/ManualScreen';
import { isRTL } from '../utils/rtl';

export type RootStackParamList = {
  Poster: undefined;
  Welcome: undefined;
  GatewayAccess: undefined;
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  P1: undefined;
  P2: undefined;
  Review: undefined;
  Result: undefined;
  About: undefined;
  Manual: { section?: 'legal' } | undefined;
  FailClosed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = isRTL(i18n.resolvedLanguage ?? i18n.language);
  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: isRtl ? 'slide_from_left' : 'slide_from_right',
        }}
        initialRouteName="GatewayAccess"
      >
        <Stack.Screen name="Poster" component={PosterScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="GatewayAccess" component={GatewayAccessScreen} />
        <Stack.Screen name="Step1" component={Step1ReceptorsScreen} />
        <Stack.Screen name="Step2" component={Step2TumourScreen} />
        <Stack.Screen name="Step3" component={Step3MarkersScreen} />
        <Stack.Screen name="P1" component={P1Screen} />
        <Stack.Screen name="P2" component={P2Screen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Manual" component={ManualScreen} />
        <Stack.Screen name="FailClosed" component={FailClosedScreen} />
      </Stack.Navigator>
  );
};
