// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAssessmentStore } from './src/store/assessmentStore';
import './src/i18n/config';   // (initializes i18n + react-i18next)

export default function App() {
  useEffect(() => {
    // A true process launch begins a new assessment cycle: no selected mode,
    // walkthrough or assessment from a prior launch survives. Evaluation access
    // is the deliberate exception (G10-0 / P3, AUTH-03): the refresh token kept
    // in the Keychain/Keystore is restored by GatewayAccessScreen, and ends only
    // on Disconnect, a gateway refusal or its flat 30-day expiry. Clearing it
    // here locked evaluators out after every restart (Gate 12 device finding).
    useAssessmentStore.getState().resetCycle();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
