const DarkColors = {
    primary: '#CCFF00', // Electric Lime
    background: '#0D0D0D', // Almost Black
    surface: '#1C1C1E', // Dark Grey
    surfaceLight: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    error: '#FF453A',
    success: '#32D74B',
    border: '#38383A'
};

const LightColors = {
    primary: '#007AFF', // Standard Blue for better look on light theme
    background: '#F2F2F7', // Off White
    surface: '#FFFFFF', // Pure White
    surfaceLight: '#E5E5EA',
    text: '#000000',
    textSecondary: '#636366',
    error: '#FF3B30',
    success: '#34C759',
    border: '#C6C6C8'
};

export const Colors = DarkColors; // Fallback/Default

export const Themes = {
    light: LightColors,
    dark: DarkColors
};

export type ThemeColors = typeof DarkColors;
