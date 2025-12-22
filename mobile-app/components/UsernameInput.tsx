import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Config } from '../constants/Config';

const API_URL = Config.API_URL;

interface UsernameInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onAvailabilityChange?: (available: boolean) => void;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({
    value,
    onChangeText,
    onAvailabilityChange
}) => {
    const { colors, theme } = useTheme();
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [message, setMessage] = useState('');
    const [touched, setTouched] = useState(false);

    // Debounced username check
    useEffect(() => {
        if (!value || value.length < 3) {
            setAvailable(null);
            setMessage('');
            setChecking(false);
            onAvailabilityChange?.(false);
            return;
        }

        setChecking(true);
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(`${API_URL}/auth/check-username?username=${value}`);
                setAvailable(response.data.available);
                setMessage(response.data.message);
                onAvailabilityChange?.(response.data.available);
            } catch (error) {
                setAvailable(null);
                setMessage('Error checking username');
                onAvailabilityChange?.(false);
            } finally {
                setChecking(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [value, onAvailabilityChange]);

    const getBorderColor = () => {
        if (!touched || !value) return colors.border;
        if (checking) return colors.border;
        if (available === true) return theme === 'dark' ? '#22c55e' : '#16a34a'; // Green
        if (available === false) return theme === 'dark' ? '#ef4444' : '#dc2626'; // Red
        return colors.border;
    };

    const getMessageColor = () => {
        if (available === true) return theme === 'dark' ? '#22c55e' : '#16a34a';
        if (available === false) return theme === 'dark' ? '#ef4444' : '#dc2626';
        return colors.textSecondary;
    };

    const getIcon = () => {
        if (checking) return null;
        if (available === true) return <Ionicons name="checkmark-circle" size={20} color={theme === 'dark' ? '#22c55e' : '#16a34a'} />;
        if (available === false) return <Ionicons name="close-circle" size={20} color={theme === 'dark' ? '#ef4444' : '#dc2626'} />;
        return null;
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: getBorderColor(),
                        borderWidth: 2,
                    },
                ]}
            >
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Choose a unique username"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={(text) => {
                        setTouched(true);
                        onChangeText(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <View style={styles.iconContainer}>
                    {checking ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        getIcon()
                    )}
                </View>
            </View>
            {touched && message && (
                <Text style={[styles.message, { color: getMessageColor() }]}>
                    {message}
                </Text>
            )}
            {touched && value && value.length < 3 && (
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                    Username must be at least 3 characters
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    iconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: '500',
    },
});
