import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from '@/navigation/AuthNavigator';
import AppNavigator from '@/navigation/AppNavigator';
import { useAuthStore } from '@/features/auth/store/authStore';

const navTheme = {
  dark: true,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#0A0A0A',
    text: '#FFFFFF',
    primary: '#7B2FFF',
    border: '#161616',
    notification: '#A259FF'
  }
};

export default function App() {
  const { initialize, session, initializing } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme as any}>
        {initializing ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#A259FF" />
          </View>
        ) : session ? (
          <AppNavigator />
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </View>
  );
}
