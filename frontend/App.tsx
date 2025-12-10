import "./global.css";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthNavigator from "@/navigation/AuthNavigator";
import AppNavigator from "@/navigation/AppNavigator";
import { useAuthStore } from "@/features/auth/store/authStore";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#000000",
    card: "#0A0A0A",
    text: "#FFFFFF",
    primary: "#7B2FFF",
    border: "#161616",
    notification: "#A259FF",
  },
};

export default function App() {
  const { initialize, session, initializing } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#A259FF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-background">
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          {session ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
