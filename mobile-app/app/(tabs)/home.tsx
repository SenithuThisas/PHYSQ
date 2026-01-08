import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useBreakpoints } from '../../hooks/useBreakpoints';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';
import { useMeasurement } from '../../context/MeasurementContext';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const { isWeb } = useBreakpoints();
    const { formatWeight, formatHeight } = useMeasurement();

    const calculateBMI = (weight: any, height: any) => {
        if (!weight?.value || !height?.value) return '--';

        let w = weight.value;
        let h = height.value;

        if (weight.unit === 'lbs') w = w * 0.453592;
        if (height.unit === 'ft') h = h * 0.3048;
        else h = h / 100; // cm to m

        const bmi = w / (h * h);
        return bmi.toFixed(1);
    };

    const getBMICategory = (bmiVal: string) => {
        const bmi = parseFloat(bmiVal);
        if (isNaN(bmi)) return '';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const getBMIColor = (category: string) => {
        if (category === 'Underweight') return '#FFC107'; // Amber/Dark Yellow
        if (category === 'Normal') return colors.primary;
        if (category === 'Overweight' || category === 'Obese') return colors.error;
        return colors.primary;
    };

    const currentBMI = user ? calculateBMI(user.weight, user.height) : '--';
    const currentCategory = getBMICategory(currentBMI);
    const bmiColor = getBMIColor(currentCategory);

    const [weeklyCount, setWeeklyCount] = React.useState(0);
    const { token, refreshUser } = useAuth();

    useFocusEffect(
        React.useCallback(() => {
            if (token) {
                refreshUser();
                import('../../services/workouts').then(({ getWeeklyStats }) => {
                    getWeeklyStats(token).then(data => setWeeklyCount(data.count));
                });
            }
        }, [token])
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, isWeb && styles.webContent]}>
            <ResponsiveContainer>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={[styles.username, { color: colors.text }]}>{user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Athlete'}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.avatar, { backgroundColor: colors.surfaceLight }]}
                        onPress={() => router.push('/(tabs)/profile')}
                    >
                        {user?.profilePicture ? (
                            <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                        ) : (
                            <Text style={[styles.avatarText, { color: colors.primary }]}>{(user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase()}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.gridContainer, isWeb && styles.webGridContainer]}>
                    <View style={[styles.section, isWeb && styles.webSection]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ready to lift?</Text>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.primary }, isWeb && styles.webActionCard]}
                            onPress={() => router.push('/(tabs)/workout')}
                        >
                            <Text style={[styles.actionTitle, { color: colors.background }]}>Start New Session</Text>
                            <Text style={styles.actionSubtitle}>Log your sets and reps</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Body Stats Section */}
                    {user && (

                        <View style={[styles.section, { width: '100%' }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Stats</Text>
                            <View style={styles.statsRow}>
                                {/* BMI Card */}
                                <TouchableOpacity
                                    style={[styles.statCard, styles.bmiCard, { backgroundColor: bmiColor, borderColor: bmiColor }]}
                                    onPress={() => router.push('/stats')}
                                >
                                    <View>
                                        <Text style={styles.statLabelLight}>BMI</Text>
                                        <Text style={[styles.statValueLight, { color: colors.background }]}>
                                            {currentBMI}
                                        </Text>
                                    </View>
                                    <View style={styles.bmiBadge}>
                                        <Text style={[styles.bmiBadgeText, { color: colors.background }]}>
                                            {currentCategory}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Weight Card */}
                                <TouchableOpacity
                                    style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => router.push('/stats')}
                                >
                                    <Text style={styles.statLabel}>Weight</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]}>
                                        {user.weight ? formatWeight(user.weight.value, user.weight.unit) : '--'}
                                    </Text>
                                </TouchableOpacity>

                                {/* Height Card */}
                                <TouchableOpacity
                                    style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => router.push('/stats')}
                                >
                                    <Text style={styles.statLabel}>Height</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]}>
                                        {user.height ? formatHeight(user.height.value, user.height.unit) : '--'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={[styles.section, isWeb && styles.webSection]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Progress</Text>
                        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={styles.statLabel}>Workouts this week</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{weeklyCount}</Text>
                        </View>
                    </View>
                </View>
            </ResponsiveContainer>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DefaultColors.background,
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    webContent: {
        alignItems: 'center', // Centers the mainWrapper
    },
    mainWrapper: {
        width: '100%',
    },
    webMainWrapper: {
        maxWidth: 1024,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 16,
        color: DefaultColors.textSecondary,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: DefaultColors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Ensure image clips to circle
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: DefaultColors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    gridContainer: {
        gap: 32,
    },
    webGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    section: {
        marginBottom: 0, // Handled by gap
    },
    webSection: {
        flex: 1,
        minWidth: 300,
    },
    sectionTitle: {
        fontSize: 18,
        color: DefaultColors.text,
        fontWeight: '600',
        marginBottom: 16,
    },
    actionCard: {
        backgroundColor: DefaultColors.primary,
        padding: 24,
        borderRadius: 20,
        shadowColor: DefaultColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        minHeight: 140, // Consistent height
        justifyContent: 'center',
    },
    webActionCard: {
        cursor: 'pointer', // Web hover cursor
    } as any, // Cast to any for web-specific prop
    actionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: DefaultColors.background,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.6)',
    },
    statCard: {
        backgroundColor: DefaultColors.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: DefaultColors.border,
        minHeight: 100, // Reduced height for smaller cards
        justifyContent: 'center',
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    bmiCard: {
        backgroundColor: DefaultColors.primary,
        borderColor: DefaultColors.primary,
        flex: 1.2, // Slightly wider
        justifyContent: 'space-between',
    },
    statLabel: {
        color: DefaultColors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statLabelLight: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statValue: {
        color: DefaultColors.text,
        fontSize: 22,
        fontWeight: 'bold',
    },
    statValueLight: {
        color: DefaultColors.background,
        fontSize: 28,
        fontWeight: '900',
    },
    unitText: {
        fontSize: 14,
        color: DefaultColors.textSecondary,
        fontWeight: 'normal',
    },
    bmiBadge: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    bmiBadgeText: {
        color: DefaultColors.background,
        fontSize: 12,
        fontWeight: '700',
    }
});
