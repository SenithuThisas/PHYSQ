import { DarkTheme, DefaultTheme, ThemeProvider as ReactNavigationThemeProvider } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Platform, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { Fonts } from '../constants/Fonts';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set default font globally
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: Fonts.regular };

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
        Inter_400Regular,
        Inter_700Bold,
    });
    const segments = useSegments();
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const { colors, theme } = useTheme();

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
        <ReactNavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
                <Stack screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background }
                }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </View>
        </ReactNavigationThemeProvider>
    );
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ToastProvider>
                    <InitialLayout />
                </ToastProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
