import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, useWindowDimensions, Platform, PixelRatio, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Responsive Font Helper
const scaleFont = (size: number) => {
    const { width: SCREEN_WIDTH } = Dimensions.get('window');
    const scale = SCREEN_WIDTH / 375; // standard iPhone 11/X width
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
};


export default function Index() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Responsive Sizes
    const isSmallDevice = width < 375;
    const isTablet = width > 768;
    const contentPadding = isTablet ? 60 : 24;

    useEffect(() => {
        // Entrance Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Button Pulse Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const FeatureItem = ({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => {
        const itemFade = useRef(new Animated.Value(0)).current;
        const itemSlide = useRef(new Animated.Value(20)).current;

        useEffect(() => {
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(itemFade, { toValue: 1, duration: 600, useNativeDriver: true }),
                    Animated.timing(itemSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
                ]),
            ]).start();
        }, []);

        const itemWidth = isTablet
            ? (width - (contentPadding * 2)) / 3 - 40
            : (width - (contentPadding * 2)) / 3 - 10;

        return (
            <Animated.View style={[
                styles.featureItem,
                {
                    width: itemWidth,
                    opacity: itemFade,
                    transform: [{ translateY: itemSlide }]
                }
            ]}>
                <View style={[styles.iconContainer, isTablet && { width: 80, height: 80, borderRadius: 40 }]}>
                    <Ionicons name={icon} size={isTablet ? 40 : 28} color={Colors.background} />
                </View>
                <Text style={[styles.featureTitle, isTablet && { fontSize: 20 }]}>{title}</Text>
                <Text style={[styles.featureDesc, isTablet && { fontSize: 16, lineHeight: 22 }]}>{desc}</Text>
            </Animated.View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 20,
                        paddingHorizontal: contentPadding
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[
                    styles.heroSection,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        marginTop: isTablet ? 60 : 20
                    }
                ]}>
                    <Text style={[styles.title, { fontSize: isSmallDevice ? 48 : (isTablet ? 96 : 64) }]}>
                        PHYSQ
                    </Text>
                    <Text style={[styles.subtitle, { fontSize: isSmallDevice ? 18 : (isTablet ? 32 : 24) }]}>
                        Defy Gravity.
                    </Text>
                    <Text style={[styles.description, { maxWidth: isTablet ? 500 : 300, fontSize: isTablet ? 20 : 16 }]}>
                        The ultimate companion for your calisthenics journey. Track progress, master skills, and build a physique that defies physics.
                    </Text>
                </Animated.View>

                <View style={[styles.featuresContainer, { marginBottom: isTablet ? 100 : 60 }]}>
                    <FeatureItem
                        icon="stats-chart"
                        title="Track"
                        desc="Log every rep and set with precision."
                        delay={400}
                    />
                    <FeatureItem
                        icon="analytics"
                        title="Analyze"
                        desc="Visualize your strength gains over time."
                        delay={600}
                    />
                    <FeatureItem
                        icon="trophy"
                        title="Master"
                        desc="Unlock skills and reach new levels."
                        delay={800}
                    />
                </View>

                <Animated.View style={[styles.actionSection, { opacity: fadeAnim }]}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                isTablet && { paddingVertical: 24, paddingHorizontal: 60, borderRadius: 120 }
                            ]}
                            onPress={() => router.push('/(auth)/signup')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.primaryButtonText, isTablet && { fontSize: 24 }]}>Get Started</Text>
                            <Ionicons name="arrow-forward" size={isTablet ? 28 : 20} color={Colors.background} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={[styles.secondaryButtonText, isTablet && { fontSize: 18 }]}>I already have an account</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        // Padding handled dynamically
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontWeight: '900',
        color: Colors.primary,
        letterSpacing: -2,
        marginBottom: 8,
        textShadowColor: 'rgba(204, 255, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 24,
        letterSpacing: 4,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    description: {
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    featureItem: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    featureDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
    },
    actionSection: {
        alignItems: 'center',
        width: '100%',
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 320,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 20,
    },
    primaryButtonText: {
        color: Colors.background,
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    secondaryButtonText: {
        color: Colors.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
});
