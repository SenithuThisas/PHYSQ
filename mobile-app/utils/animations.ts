import { useRef } from 'react';
import { Animated } from 'react-native';

// ============================================
// SHAKE ANIMATION HOOK
// ============================================

export const useShakeAnimation = () => {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    return {
        shakeAnim,
        shake,
        style: {
            transform: [{ translateX: shakeAnim }],
        },
    };
};

// ============================================
// REUSABLE ANIMATION CONFIGS
// ============================================

export const fadeConfig = {
    duration: 200,
    useNativeDriver: true,
};

export const slideConfig = {
    duration: 300,
    useNativeDriver: true,
};

export const scaleConfig = {
    duration: 150,
    useNativeDriver: true,
};
