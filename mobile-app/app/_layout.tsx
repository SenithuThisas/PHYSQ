import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        // If we had custom fonts, we'd load them here. 
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        } else {
            // Mock loading
            setTimeout(() => SplashScreen.hideAsync(), 1000);
        }
    }, [loaded]);

    return (
        <AuthProvider>
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar style="light" />
                <Stack screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background }
                }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </View>
        </AuthProvider>
    );
}
