import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function Index() {
    const router = useRouter();

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

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

        return (
            <Animated.View style={[styles.featureItem, { opacity: itemFade, transform: [{ translateY: itemSlide }] }]}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={28} color={Colors.background} />
                </View>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDesc}>{desc}</Text>
            </Animated.View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.title}>PHYSQ</Text>
                    <Text style={styles.subtitle}>Defy Gravity.</Text>
                    <Text style={styles.description}>
                        The ultimate companion for your calisthenics journey. Track progress, master skills, and build a physique that defies physics.
                    </Text>
                </Animated.View>

                <View style={styles.featuresContainer}>
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
                            style={styles.primaryButton}
                            onPress={() => router.push('/(auth)/signup')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                            <Ionicons name="arrow-forward" size={20} color={Colors.background} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.secondaryButtonText}>I already have an account</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.footerSpacing} />
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
        paddingTop: 80,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 64,
        fontWeight: '900',
        color: Colors.primary,
        letterSpacing: -2,
        marginBottom: 8,
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
        marginBottom: 60,
    },
    featureItem: {
        alignItems: 'center',
        width: (width - 48) / 3 - 10,
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
    footerSpacing: {
        height: 40,
    }
});
