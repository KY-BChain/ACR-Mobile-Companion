import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { Step1ReceptorsScreen } from '../screens/Step1ReceptorsScreen';
import { Step2TumourScreen } from '../screens/Step2TumourScreen';
import { Step3MarkersScreen } from '../screens/Step3MarkersScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { FailClosedScreen } from '../screens/FailClosedScreen';
import { checkAttestation } from '../api/attestation';
import { useAssessmentStore } from '../store/assessmentStore';

export type RootStackParamList = {
  Welcome: undefined;
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  Review: undefined;
  Result: undefined;
  About: undefined;
  FailClosed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { setAttestation } = useAssessmentStore();

  useEffect(() => {
    // Initial attestation check on app launch
    checkAttestation()
      .then(setAttestation)
      .catch(() => {
        setAttestation(null);
      });
  }, [setAttestation]);

  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Step1" component={Step1ReceptorsScreen} />
        <Stack.Screen name="Step2" component={Step2TumourScreen} />
        <Stack.Screen name="Step3" component={Step3MarkersScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="FailClosed" component={FailClosedScreen} />
      </Stack.Navigator>
  );
};
