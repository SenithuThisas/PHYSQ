import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Themes, ThemeColors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    colors: Themes.dark,
    toggleTheme: () => { },
    setTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('dark'); // Default to dark

    useEffect(() => {
        // Load saved theme or use system
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user-theme');
                if (savedTheme === 'light' || savedTheme === 'dark') {
                    setThemeState(savedTheme);
                } else if (systemScheme) {
                    setThemeState(systemScheme);
                }
            } catch (error) {
                console.log('Error loading theme:', error);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('user-theme', newTheme);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('user-theme', newTheme);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const colors = Themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
