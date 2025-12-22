import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    StyleSheet,
    TouchableOpacity,
    KeyboardTypeOptions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
    isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    isPassword = false,
    style,
    ...props
}) => {
    const { colors, theme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    const borderColor = error
        ? (theme === 'dark' ? '#ef4444' : '#dc2626') // Red for error
        : isFocused
            ? colors.primary
            : colors.border;

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: borderColor,
                    },
                    style,
                ]}
            >
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={togglePassword} style={styles.eyeIcon}>
                        <FontAwesome
                            name={showPassword ? 'eye' : 'eye-slash'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && error.trim().length > 0 && (
                <Text style={[styles.errorText, { color: theme === 'dark' ? '#ef4444' : '#dc2626' }]}>
                    {error}
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
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
