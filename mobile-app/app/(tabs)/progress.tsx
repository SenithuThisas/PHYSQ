import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBreakpoints } from '../../hooks/useBreakpoints';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { getWorkoutStats } from '../../services/workouts';
import { useFocusEffect } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';

type Tab = 'Overview' | 'Exercises' | 'Measures' | 'Photos';
type TimePeriod = '3 Months' | '6 Months' | 'Year-to-Date';
type Metric = 'Duration' | 'Volume' | 'Workouts';

const StatsCard = ({ title, value, subtitle, icon, color }: any) => (
    <View style={{
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 16,
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center'
    }}>
        <Ionicons name={icon} size={24} color={color} style={{ marginBottom: 8 }} />
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{value}</Text>
        <Text style={{ color: '#888', fontSize: 12 }}>{title}</Text>
        {subtitle && <Text style={{ color: color, fontSize: 10, marginTop: 4 }}>{subtitle}</Text>}
    </View>
);

const BadgeItem = ({ badge }: any) => (
    <View style={{ alignItems: 'center', marginRight: 16, opacity: badge.unlocked ? 1 : 0.4 }}>
        <LinearGradient
            colors={badge.unlocked ? ['#CCFF00', '#00bfa5'] : ['#333', '#444']}
            style={{
                width: 64, height: 64, borderRadius: 32,
                justifyContent: 'center', alignItems: 'center',
                marginBottom: 8
            }}
        >
            <Ionicons name={badge.icon} size={32} color={badge.unlocked ? '#000' : '#888'} />
        </LinearGradient>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{badge.label}</Text>
    </View>
);

export default function Progress() {
    const { colors } = useTheme();
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('3 Months');
    const [selectedMetric, setSelectedMetric] = useState<Metric>('Duration');
    const { width } = useBreakpoints();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    // Calculate chart width constrained by max width (1280) and padding (48)
    const chartWidth = Math.min(width, 1280) - 48;

    const fetchStats = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await getWorkoutStats(token, timePeriod);
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [token, timePeriod])
    );

    const tabs: Tab[] = ['Overview', 'Exercises', 'Measures', 'Photos'];
    const timePeriods: TimePeriod[] = ['3 Months', '6 Months', 'Year-to-Date'];
    const metrics: { key: Metric; icon: string; label: string }[] = [
        { key: 'Duration', icon: 'time-outline', label: 'Duration' },
        { key: 'Volume', icon: 'bar-chart-outline', label: 'Volume' },
        { key: 'Workouts', icon: 'trending-up', label: 'Workouts' }
    ];

    const getChartData = () => {
        if (!stats || !stats.chartData) return { labels: [], datasets: [{ data: [] }] };

        const labels = stats.chartData.labels;
        let data = [];

        if (selectedMetric === 'Duration') data = stats.chartData.datasets.Duration;
        else if (selectedMetric === 'Volume') data = stats.chartData.datasets.Volume;
        else data = stats.chartData.datasets.Workouts;

        return {
            labels,
            datasets: [{ data }]
        };
    };

    const chartData = getChartData();

    // Gamified Calendar Renderer
    const renderDay = useCallback(({ date, state }: any) => {
        if (state === 'disabled') return <View style={{ height: 48, width: 48 }} />; // Empty spacer

        const dateStr = date.dateString;
        const dayStat = stats?.dailyStats?.[dateStr];
        const level = dayStat?.level || 0;

        // Level Colors
        let bgColors = ['transparent', 'transparent'];
        let borderColor = 'transparent';
        let glow = false;

        if (level === 1) { borderColor = '#333'; bgColors = ['#222', '#222']; }
        if (level === 2) { borderColor = '#CCFF00'; bgColors = ['rgba(204, 255, 0, 0.1)', 'rgba(204, 255, 0, 0.05)']; }
        if (level === 3) { borderColor = '#00F0FF'; bgColors = ['rgba(0, 240, 255, 0.2)', 'rgba(0, 240, 255, 0.1)']; glow = true; }
        if (level === 4) { borderColor = '#FFD700'; bgColors = ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.1)']; glow = true; } // Gold

        return (
            <TouchableOpacity onPress={() => {/* Show tooltip/details */ }} style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <LinearGradient
                    colors={bgColors as any}
                    style={{
                        height: 36, width: 36,
                        borderRadius: 12,
                        justifyContent: 'center', alignItems: 'center',
                        borderWidth: 1,
                        borderColor: borderColor,
                        elevation: glow ? 5 : 0
                    }}
                >
                    <Text style={{
                        color: level > 0 ? '#fff' : '#444',
                        fontWeight: level > 2 ? 'bold' : 'normal',
                        fontSize: 14
                    }}>
                        {date.day}
                    </Text>
                </LinearGradient>
                {/* XP Indicator dots */}
                {level > 0 && (
                    <View style={{ flexDirection: 'row', marginTop: 4, gap: 2 }}>
                        {[...Array(level > 4 ? 4 : level)].map((_, i) => (
                            <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: borderColor }} />
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [stats]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ResponsiveContainer>
                {/* Top Navigation Bar */}
                <View style={styles.topNav}>
                    <View style={styles.tabContainer}>
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab}
                                style={styles.tab}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: activeTab === tab ? colors.primary : colors.textSecondary }
                                ]}>{tab}</Text>
                                {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.topActions}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="share-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="calendar-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* 1. Header & Stats Dashboard */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 0 }}>
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>Progress</Text>
                            <View style={{ backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Level {stats?.totalWorkouts ? Math.floor(stats.totalWorkouts / 10) + 1 : 1}</Text>
                            </View>
                        </View>

                        {/* Dashboard Grid */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                            <StatsCard
                                title="Current Streak"
                                value={`${stats?.currentStreak || 0} Days`}
                                icon="flame"
                                color="#FF4D4D"
                                subtitle="Keep it up!"
                            />
                            <StatsCard
                                title="Best Streak"
                                value={`${stats?.bestStreak || 0} Days`}
                                icon="trophy"
                                color="#FFD700"
                                subtitle="All time best"
                            />
                            <StatsCard
                                title="Total Workouts"
                                value={stats?.totalWorkouts || 0}
                                icon="barbell"
                                color="#CCFF00"
                                subtitle="Lifetime"
                            />
                        </View>

                        {/* 2. Badges Section */}
                        <View style={{ marginBottom: 32 }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Achievements</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {stats?.badges?.map((badge: any) => (
                                    <BadgeItem key={badge.id} badge={badge} />
                                )) || <Text style={{ color: '#666' }}>Complete a workout to unlock badges!</Text>}
                            </ScrollView>
                        </View>

                        {/* 3. Gamified Activity Calendar */}
                        <View style={{ marginBottom: 32 }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Activity Map</Text>
                            <View style={{ backgroundColor: '#111', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#333' }}>
                                <Calendar
                                    current={new Date().toISOString()}
                                    key={stats?.currentStreak} // Force re-render on data change
                                    dayComponent={renderDay}
                                    theme={{
                                        calendarBackground: 'transparent',
                                        textSectionTitleColor: '#888',
                                        arrowColor: colors.primary,
                                        monthTextColor: '#fff',
                                        textMonthFontWeight: 'bold',
                                        textMonthFontSize: 20,
                                    }}
                                    disableMonthChange={false}
                                />
                            </View>
                            {/* Calendar Legend */}
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 12, alignItems: 'center' }}>
                                <Text style={{ color: '#666', fontSize: 12 }}>Less</Text>
                                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: '#222', borderWidth: 1, borderColor: '#333' }} />
                                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: 'rgba(204, 255, 0, 0.1)', borderWidth: 1, borderColor: '#CCFF00' }} />
                                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: 'rgba(0, 240, 255, 0.2)', borderWidth: 1, borderColor: '#00F0FF' }} />
                                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: 'rgba(255, 215, 0, 0.3)', borderWidth: 1, borderColor: '#FFD700' }} />
                                <Text style={{ color: '#666', fontSize: 12 }}>More</Text>
                            </View>
                        </View>

                        {/* Time Period Filter */}
                        <View style={styles.filterContainer}>
                            {timePeriods.map(period => (
                                <TouchableOpacity
                                    key={period}
                                    style={[
                                        styles.filterPill,
                                        { backgroundColor: timePeriod === period ? colors.text : colors.surface },
                                        { borderColor: colors.border }
                                    ]}
                                    onPress={() => setTimePeriod(period)}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        { color: timePeriod === period ? colors.background : colors.textSecondary }
                                    ]}>{period}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Metric Selector */}
                        <View style={styles.metricSelector}>
                            {metrics.map(metric => (
                                <TouchableOpacity
                                    key={metric.key}
                                    style={[
                                        styles.metricPill,
                                        { backgroundColor: colors.surface },
                                        selectedMetric === metric.key && { borderColor: colors.primary, borderWidth: 2 }
                                    ]}
                                    onPress={() => setSelectedMetric(metric.key)}
                                >
                                    <Ionicons name={metric.icon as any} size={20} color={selectedMetric === metric.key ? colors.primary : colors.textSecondary} />
                                    <Text style={[
                                        styles.metricText,
                                        { color: selectedMetric === metric.key ? colors.primary : colors.textSecondary }
                                    ]}>{metric.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Interactive Progress Chart */}
                        <View style={styles.chartContainer}>
                            {chartData.datasets[0].data.length > 0 ? (
                                <LineChart
                                    data={chartData}
                                    width={chartWidth}
                                    height={240}
                                    yAxisLabel=""
                                    yAxisSuffix={selectedMetric === 'Duration' ? 'm' : ''}
                                    chartConfig={{
                                        backgroundColor: colors.surface,
                                        backgroundGradientFrom: colors.surface,
                                        backgroundGradientTo: colors.surface,
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(204, 255, 0, ${opacity})`, // Primary color
                                        labelColor: (opacity = 1) => colors.textSecondary,
                                        style: { borderRadius: 16 },
                                        propsForDots: {
                                            r: '6',
                                            strokeWidth: '2',
                                            stroke: colors.primary,
                                            fill: colors.background
                                        }
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            ) : (
                                <View style={[styles.chart, { height: 240, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }]}>
                                    <Text style={{ color: colors.textSecondary }}>No data for this period</Text>
                                </View>
                            )}
                        </View>

                        {/* This Week Overview - Muscles */}
                        <View style={styles.weekOverview}>
                            <Text style={[styles.weekTitle, { color: colors.text }]}>Targeted Muscles</Text>
                            <Text style={[styles.weekSubtitle, { color: colors.textSecondary }]}>This week's focus</Text>

                            {stats?.weeklyMuscles && stats.weeklyMuscles.length > 0 ? (
                                <View style={styles.muscleList}>
                                    {stats.weeklyMuscles.map((muscle: string, index: number) => (
                                        <View key={index} style={[styles.muscleItem, { backgroundColor: colors.surface }]}>
                                            <View style={[styles.muscleIcon, { backgroundColor: `${colors.primary}20` }]}>
                                                <MaterialCommunityIcons name="arm-flex" size={20} color={colors.primary} />
                                            </View>
                                            <Text style={[styles.muscleText, { color: colors.text }]}>{muscle}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No workouts this week yet</Text>
                            )}
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </ResponsiveContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DefaultColors.background,
    },
    topNav: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 16,
    },
    tab: {
        paddingBottom: 8,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderRadius: 2,
    },
    topActions: {
        position: 'absolute',
        top: 60,
        right: 24,
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryCard: {
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
    },
    summaryLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    metricSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    metricPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    metricText: {
        fontSize: 14,
        fontWeight: '600',
    },
    chartContainer: {
        marginBottom: 24,
    },
    chart: {
        borderRadius: 16,
    },
    calendarSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    calendarContainer: {
        borderRadius: 16,
        padding: 10,
        overflow: 'hidden'
    },
    goalSection: {
        marginBottom: 24,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    goalLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    goalIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalContent: {
        flex: 1,
    },
    goalDescription: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    goalProgress: {
        fontSize: 14,
    },
    setGoalBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    setGoalText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    weekOverview: {
        marginBottom: 24,
    },
    weekTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    weekSubtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    muscleList: {
        gap: 12,
    },
    muscleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    muscleIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    muscleText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 24,
    },
});
