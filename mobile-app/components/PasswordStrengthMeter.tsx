import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getPasswordStrength, PasswordStrength } from '../utils/validation';

interface PasswordStrengthMeterProps {
    password: string;
    show?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
    password,
    show = true
}) => {
    const { colors } = useTheme();
    const strength = getPasswordStrength(password);

    const progressStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(`${(strength.score / 5) * 100}%`, {
                duration: 300,
            }),
            backgroundColor: strength.color,
        };
    });

    if (!show || !password) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: strength.color }]}>
                    {strength.label}
                </Text>
                {strength.suggestions.length > 0 && (
                    <Text style={[styles.suggestion, { color: colors.textSecondary }]}>
                        {strength.suggestions[0]}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 4,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
    },
    suggestion: {
        fontSize: 11,
        fontStyle: 'italic',
    },
});
