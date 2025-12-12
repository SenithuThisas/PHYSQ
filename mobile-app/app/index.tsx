import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, useWindowDimensions, Platform, PixelRatio, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Responsive Breakpoints
    const isMobile = width < 768; // Tablet/Desktop breakpoint
    const isSmallDevice = width < 375;

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    const NavBar = () => {
        if (isMobile) return null;
        return (
            <View style={[styles.navBar, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.navLogo}>PHYSQ</Text>
                <View style={styles.navLinks}>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.navLinkText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <Text style={styles.navButtonText}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

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

        const itemWidth = isMobile
            ? (width - 48) / 3 - 10
            : (width - 120) / 3 - 40;

        return (
            <Animated.View style={[
                styles.featureItem,
                {
                    width: itemWidth,
                    opacity: itemFade,
                    transform: [{ translateY: itemSlide }],
                    alignItems: isMobile ? 'center' : 'flex-start'
                }
            ]}>
                <View style={[styles.iconContainer,
                !isMobile && { width: 64, height: 64, borderRadius: 16, marginBottom: 24 }
                ]}>
                    <Ionicons name={icon} size={isMobile ? 28 : 32} color={Colors.background} />
                </View>
                <Text style={[styles.featureTitle, !isMobile && { fontSize: 20, marginBottom: 12, textAlign: 'left' }]}>{title}</Text>
                <Text style={[styles.featureDesc, !isMobile && { fontSize: 16, lineHeight: 24, textAlign: 'left' }]}>{desc}</Text>
            </Animated.View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />

            <NavBar />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: isMobile ? insets.top + 40 : 100,
                        paddingBottom: insets.bottom + 40,
                        paddingHorizontal: isMobile ? 24 : 100 // More padding on desktop
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO SECTION */}
                <View style={[
                    styles.heroContainer,
                    !isMobile && { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 120 }
                ]}>
                    <Animated.View style={[
                        styles.heroContent,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: isMobile ? 1 : 0.5 }
                    ]}>
                        <Text style={[
                            styles.title,
                            !isMobile && { fontSize: 80, textAlign: 'left', lineHeight: 85 }
                        ]}>
                            PHYSQ
                        </Text>
                        <Text style={[
                            styles.subtitle,
                            !isMobile && { fontSize: 28, textAlign: 'left', marginBottom: 32 }
                        ]}>
                            Defy Gravity.
                        </Text>
                        <Text style={[
                            styles.description,
                            !isMobile && { textAlign: 'left', fontSize: 18, maxWidth: 500, marginBottom: 40 }
                        ]}>
                            The ultimate companion for your calisthenics journey. Track progress, master skills, and build a physique that defies physics.
                        </Text>

                        {/* DESKTOP CTA (Hidden on Mobile) */}
                        {!isMobile && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={[styles.primaryButton, { paddingVertical: 20, paddingHorizontal: 48 }]}
                                    onPress={() => router.push('/(auth)/signup')}
                                >
                                    <Text style={[styles.primaryButtonText, { fontSize: 20 }]}>Start Training</Text>
                                    <Ionicons name="arrow-forward" size={24} color={Colors.background} style={{ marginLeft: 12 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>

                    {/* HERO IMAGE / VISUAL PLACEHOLDER (Desktop Only) */}
                    {!isMobile && (
                        <Animated.View style={{ flex: 0.4, opacity: fadeAnim, transform: [{ scale: slideAnim.interpolate({ inputRange: [0, 50], outputRange: [1, 0.9] }) }] }}>
                            <View style={{
                                width: '100%',
                                aspectRatio: 1,
                                backgroundColor: Colors.surface,
                                borderRadius: 40,
                                borderWidth: 1,
                                borderColor: Colors.primary,
                                opacity: 0.2, // Placeholder opacity
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Ionicons name="barbell-outline" size={120} color={Colors.primary} />
                            </View>
                        </Animated.View>
                    )}
                </View>

                {/* FEATURES SECTION */}
                <View style={[styles.featuresContainer, !isMobile && { marginBottom: 120 }]}>
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

                {/* MOBILE ONLY ACTIONS */}
                {isMobile && (
                    <Animated.View style={[styles.actionSection, { opacity: fadeAnim }]}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/(auth)/signup')}
                        >
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                            <Ionicons name="arrow-forward" size={20} color={Colors.background} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.secondaryButtonText}>I already have an account</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* FOOTER */}
                <View style={{ alignItems: 'center', opacity: 0.5, marginBottom: 20 }}>
                    <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>© 2025 PHYSQ</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    navBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 60,
        paddingBottom: 20,
        zIndex: 10,
        // backgroundColor: 'rgba(13,13,13,0.8)', // Optional glass effect
    },
    navLogo: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.text,
        letterSpacing: 1,
    },
    navLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    navLinkText: {
        color: Colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
    navButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 100,
    },
    navButtonText: {
        color: Colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    },
    scrollContent: {
        flexGrow: 1,
    },
    heroContainer: {
        marginBottom: 60,
    },
    heroContent: {
        alignItems: 'center', // Center on mobile
    },
    title: {
        fontSize: 64,
        fontWeight: '900',
        color: Colors.primary,
        letterSpacing: -2,
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(204, 255, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 24,
        letterSpacing: 4,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 60,
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
        marginBottom: 40,
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
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
        marginTop: 20,
    },
    secondaryButtonText: {
        color: Colors.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
});
