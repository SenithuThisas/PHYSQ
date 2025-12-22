import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onHide: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onHide, duration = 3000 }) => {
    const { colors, theme } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => {
            onHide();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onHide]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return theme === 'dark' ? 'rgba(34, 197, 94, 0.9)' : '#22c55e';
            case 'error':
                return theme === 'dark' ? 'rgba(239, 68, 68, 0.9)' : '#ef4444';
            case 'info':
            default:
                return theme === 'dark' ? 'rgba(59, 130, 246, 0.9)' : '#3b82f6';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'alert-circle';
            case 'info':
            default:
                return 'information-circle';
        }
    };

    return (
        <Animated.View
            entering={FadeInDown.springify()}
            exiting={FadeOutDown}
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() }
            ]}
        >
            <Ionicons name={getIcon()} size={24} color="#fff" style={styles.icon} />
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 20,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
    },
    icon: {
        marginRight: 12,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});
