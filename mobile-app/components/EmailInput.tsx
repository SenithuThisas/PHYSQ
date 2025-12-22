import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Config } from '../constants/Config';
import { useServerValidation } from '../utils/validation';

const API_URL = Config.API_URL;

interface EmailInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onAvailabilityChange?: (available: boolean) => void;
    error?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
    value,
    onChangeText,
    onAvailabilityChange,
    error: externalError,
}) => {
    const { colors, theme } = useTheme();
    const [touched, setTouched] = useState(false);

    // Real-time server validation
    const { loading, available, message } = useServerValidation(
        `${API_URL}/auth/check-email`,
        value,
        500,
        1 // Min length for email check
    );

    // Simple format validation
    const isValidFormat = value.includes('@') && value.includes('.');

    React.useEffect(() => {
        if (available !== null) {
            onAvailabilityChange?.(available);
        }
    }, [available, onAvailabilityChange]);

    const getBorderColor = () => {
        if (!touched || !value) return colors.border;
        if (externalError) return theme === 'dark' ? '#ef4444' : '#dc2626'; // Red
        if (loading) return colors.border;
        if (available === false) return theme === 'dark' ? '#ef4444' : '#dc2626'; // Red - taken
        if (available === true && isValidFormat) return theme === 'dark' ? '#22c55e' : '#16a34a'; // Green
        return colors.border;
    };

    const getMessageColor = () => {
        if (externalError) return theme === 'dark' ? '#ef4444' : '#dc2626';
        if (available === true) return theme === 'dark' ? '#22c55e' : '#16a34a';
        if (available === false) return theme === 'dark' ? '#ef4444' : '#dc2626';
        return colors.textSecondary;
    };

    const getIcon = () => {
        if (loading) return null;
        if (available === false) return <Ionicons name="close-circle" size={20} color={theme === 'dark' ? '#ef4444' : '#dc2626'} />;
        if (available === true && isValidFormat) return <Ionicons name="checkmark-circle" size={20} color={theme === 'dark' ? '#22c55e' : '#16a34a'} />;
        return null;
    };

    const displayMessage = externalError || (touched && message);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
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
                    placeholder="gymbro@example.com"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={(text) => {
                        setTouched(true);
                        onChangeText(text.toLowerCase().trim());
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                />
                <View style={styles.iconContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        getIcon()
                    )}
                </View>
            </View>
            {touched && displayMessage && (
                <Text style={[styles.message, { color: getMessageColor() }]}>
                    {displayMessage}
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
