import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'web') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Invalid DOM property')) return;
        if (typeof args[0] === 'string' && args[0].includes('Unknown event handler property')) return;
        originalConsoleError(...args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('shadow* style props are deprecated')) return;
        if (typeof args[0] === 'string' && args[0].includes('textShadow* style props are deprecated')) return;
        if (typeof args[0] === 'string' && args[0].includes('TouchableMixin is deprecated')) return;
        if (typeof args[0] === 'string' && args[0].includes('props.pointerEvents is deprecated')) return;
        originalConsoleWarn(...args);
    };
}

const InitialLayout = () => {
    const [loaded] = useFonts({
    });
    const segments = useSegments();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        const inLanding = (segments as string[]).length === 0; // Assuming index is root

        if (!user && inTabsGroup) {
            router.replace('/');
        } else if (user && (inLanding || inAuthGroup)) {
            router.replace('/(tabs)/home');
        }
    }, [user, segments, isLoading]);

    if (!loaded) return null;

    return (
        <ThemeProvider value={DarkTheme}>
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
        </ThemeProvider>
    );
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <InitialLayout />
        </AuthProvider>
    );
}
