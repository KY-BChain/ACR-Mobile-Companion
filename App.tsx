// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { gatewayClient } from './src/api/client';
import { useAssessmentStore } from './src/store/assessmentStore';
import './src/i18n/config';   // (initializes i18n + react-i18next)

export default function App() {
  useEffect(() => {
    // A true process launch begins a new evaluation cycle. Nothing from a prior
    // invitation, token family, selected mode, walkthrough or assessment survives.
    gatewayClient.clearSession();
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
