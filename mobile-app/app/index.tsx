import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, useWindowDimensions, Platform, Easing, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // States
    const [isAppReady, setIsAppReady] = useState(false);

    // Responsive Breakpoints
    const isMobile = width < 768;
    const CONTENT_PADDING = isMobile ? 24 : 60;
    const MAX_WIDTH = 1200;

    // Animation Values - Splash
    const splashOpacity = useRef(new Animated.Value(1)).current;
    const splashScale = useRef(new Animated.Value(0.8)).current;

    // Animation Values - Content
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const heroTranslateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // 1. Splash Animation Sequence
        Animated.sequence([
            // Pulse In
            Animated.timing(splashScale, {
                toValue: 1.1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // Pulse Out/Hold
            Animated.timing(splashScale, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.delay(300),
            // Fade Out Splash
            Animated.timing(splashOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsAppReady(true);
            // 2. Reveal Content Animation
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(heroTranslateY, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                })
            ]).start();
        });
    }, []);

    // Reusable Hover Hook
    const useHoverAnimation = (scaleTo = 1.05) => {
        const scale = useRef(new Animated.Value(1)).current;

        const onHoverIn = () => {
            Animated.spring(scale, { toValue: scaleTo, friction: 3, useNativeDriver: true }).start();
        };

        const onHoverOut = () => {
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
        };

        return { scale, onHoverIn, onHoverOut };
    };

    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    const HoverButton = ({
        onPress,
        style,
        children,
        secondary = false
    }: { onPress: () => void, style: any, children: React.ReactNode, secondary?: boolean }) => {
        const { scale, onHoverIn, onHoverOut } = useHoverAnimation(1.05);

        return (
            <AnimatedPressable
                onPress={onPress}
                onHoverIn={onHoverIn}
                onHoverOut={onHoverOut}
                style={[style, { transform: [{ scale }] }]}
            >
                {children}
            </AnimatedPressable>
        );
    };

    const NavBar = () => (
        <View style={[styles.navBar, { paddingHorizontal: CONTENT_PADDING, paddingTop: insets.top + (isMobile ? 12 : 24) }]}>
            <View style={[styles.navContent, { maxWidth: MAX_WIDTH }]}>
                <Text style={styles.navLogo}>PHYSQ</Text>
                {!isMobile && (
                    <View style={styles.navLinks}>
                        <HoverButton
                            style={styles.navSecondaryButton}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.navSecondaryButtonText}>Login</Text>
                        </HoverButton>
                        <HoverButton
                            style={styles.navButton}
                            onPress={() => router.push('/(auth)/signup')}
                        >
                            <Text style={styles.navButtonText}>Get Started</Text>
                        </HoverButton>
                    </View>
                )}
            </View>
        </View>
    );

    const FeatureItem = ({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => {
        // Independent animation for features (Entrance)
        const itemOpacity = useRef(new Animated.Value(0)).current;
        const itemY = useRef(new Animated.Value(30)).current;

        // Hover Animation
        const { scale, onHoverIn, onHoverOut } = useHoverAnimation(1.1);

        useEffect(() => {
            if (isAppReady) {
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.parallel([
                        Animated.timing(itemOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                        Animated.timing(itemY, { toValue: 0, duration: 600, useNativeDriver: true })
                    ])
                ]).start();
            }
        }, [isAppReady]);

        const itemWidth = isMobile ? '100%' : '30%';

        return (
            <AnimatedPressable
                onHoverIn={onHoverIn}
                onHoverOut={onHoverOut}
                style={[
                    styles.featureItem,
                    {
                        width: itemWidth,
                        opacity: itemOpacity,
                        transform: [{ translateY: itemY }, { scale }]
                    }
                ]}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={32} color={Colors.background} />
                </View>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDesc}>{desc}</Text>
            </AnimatedPressable>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <StatusBar style="light" />

            {/* SPLASH SCREEN */}
            {!isAppReady && (
                <Animated.View style={[styles.splashContainer, { opacity: splashOpacity }]}>
                    <Animated.Text style={[styles.splashLogo, { transform: [{ scale: splashScale }] }]}>
                        PHYSQ
                    </Animated.Text>
                </Animated.View>
            )}

            {/* MAIN CONTENT */}
            <NavBar />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: CONTENT_PADDING, paddingTop: isMobile ? 100 : 160, paddingBottom: 60 }}>

                    {/* HERO SECTION */}
                    <Animated.View style={[
                        styles.heroContainer,
                        isMobile ? { flexDirection: 'column' } : { flexDirection: 'row', alignItems: 'center' },
                        { opacity: contentOpacity, transform: [{ translateY: heroTranslateY }] }
                    ]}>
                        {/* LEFT: Text */}
                        <View style={{ flex: isMobile ? 1 : 0.6, marginBottom: isMobile ? 60 : 0, paddingRight: isMobile ? 0 : 40 }}>
                            <Text style={[styles.heroTitle, { textAlign: isMobile ? 'center' : 'left' }]}>PHYSQ</Text>
                            <Text style={[styles.heroSubtitle, { textAlign: isMobile ? 'center' : 'left' }]}>DEFY GRAVITY.</Text>
                            <Text style={[styles.heroDesc, { textAlign: isMobile ? 'center' : 'left' }]}>
                                The ultimate companion for your calisthenics journey. Track progress, master skills, and build a physique that defies physics.
                            </Text>

                            <View style={{ alignItems: isMobile ? 'center' : 'flex-start' }}>
                                <HoverButton
                                    style={styles.heroButton}
                                    onPress={() => router.push('/(auth)/signup')}
                                >
                                    <Text style={styles.heroButtonText}>START TRAINING</Text>
                                    <Ionicons name="arrow-forward" size={24} color={Colors.background} style={{ marginLeft: 8 }} />
                                </HoverButton>
                            </View>
                        </View>

                        {/* RIGHT: Visual */}
                        <View style={{ flex: isMobile ? 1 : 0.4, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={[styles.visualPlaceholder, { width: isMobile ? 300 : '100%' }]}>
                                <Ionicons name="barbell" size={isMobile ? 80 : 120} color={Colors.primary} style={{ opacity: 0.8 }} />
                            </View>
                        </View>
                    </Animated.View>

                    {/* FEATURES SECTION (Centered) */}
                    <View style={[
                        styles.featuresGrid,
                        isMobile ? { flexDirection: 'column', gap: 40 } : { flexDirection: 'row', justifyContent: 'space-between' }
                    ]}>
                        <FeatureItem icon="stats-chart" title="Track" desc="Log every rep and set with precision." delay={200} />
                        <FeatureItem icon="analytics" title="Analyze" desc="Visualize your strength gains over time." delay={400} />
                        <FeatureItem icon="trophy" title="Master" desc="Unlock skills and reach new levels." delay={600} />
                    </View>

                    {/* MOBILE LOGIN LINK (Since navbar is streamlined on mobile) */}
                    {isMobile && (
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginTop: 60, alignSelf: 'center' }}>
                            <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>Already have an account? Login</Text>
                        </TouchableOpacity>
                    )}

                </View>

                {/* Footer */}
                <View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: Colors.surfaceLight }}>© 2025 PHYSQ</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background,
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashLogo: {
        fontSize: 64,
        fontWeight: '900',
        color: Colors.primary,
        letterSpacing: 2,
    },
    navBar: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 50,
        alignItems: 'center',
    },
    navContent: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        gap: 16,
    },
    navSecondaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 100,
        backgroundColor: Colors.surface, // Visible background
    },
    navSecondaryButtonText: {
        color: Colors.text,
        fontWeight: 'bold',
        fontSize: 14,
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
        fontSize: 14,
    },
    heroContainer: {
        marginBottom: 100,
    },
    heroTitle: {
        fontSize: 64,
        fontWeight: '900',
        color: Colors.primary,
        marginBottom: 8,
        letterSpacing: -1,
        textShadowColor: 'rgba(204, 255, 0, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
    },
    heroSubtitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 24,
        letterSpacing: 4,
    },
    heroDesc: {
        fontSize: 18,
        color: Colors.textSecondary,
        lineHeight: 28,
        maxWidth: 500,
        marginBottom: 40,
    },
    heroButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 50,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    heroButtonText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    visualPlaceholder: {
        aspectRatio: 1,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#2C2C2E',
        backgroundColor: '#0F0F0F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuresGrid: {
        width: '100%',
    },
    featureItem: {
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        backgroundColor: Colors.primary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    featureDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
