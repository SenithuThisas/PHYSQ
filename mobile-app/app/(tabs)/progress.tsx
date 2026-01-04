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

type Tab = 'Overview' | 'Exercises' | 'Measures' | 'Photos';
type TimePeriod = '3 Months' | '6 Months' | 'Year-to-Date';
type Metric = 'Duration' | 'Volume' | 'Workouts';

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

                        {/* Weekly Summary */}
                        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>This week</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{stats?.weeklyMinutes || 0}min</Text>
                            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                                Current Streak: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{stats?.currentStreak || 0} days</Text> 🔥
                            </Text>
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

                        {/* Streak Calendar */}
                        <View style={styles.calendarSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Calendar</Text>
                            <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
                                <Calendar
                                    // Current month is default
                                    markedDates={stats?.calendarData || {}}
                                    theme={{
                                        backgroundColor: colors.surface,
                                        calendarBackground: colors.surface,
                                        textSectionTitleColor: colors.textSecondary,
                                        selectedDayBackgroundColor: colors.primary,
                                        selectedDayTextColor: '#000000',
                                        todayTextColor: colors.primary,
                                        dayTextColor: colors.text,
                                        textDisabledColor: '#444',
                                        dotColor: colors.primary,
                                        selectedDotColor: '#ffffff',
                                        arrowColor: colors.primary,
                                        monthTextColor: colors.text,
                                        indicatorColor: colors.primary,
                                        textDayFontWeight: '300',
                                        textMonthFontWeight: 'bold',
                                        textDayHeaderFontWeight: '300',
                                        textDayFontSize: 14,
                                        textMonthFontSize: 16,
                                        textDayHeaderFontSize: 14
                                    }}
                                />
                            </View>
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

                        {/* Goal Management Section - Placeholder for future feature */}
                        <View style={styles.goalSection}>
                            <View style={styles.goalHeader}>
                                <Text style={[styles.goalTitle, { color: colors.text }]}>Suggested Goal</Text>
                            </View>

                            <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
                                <View style={[styles.goalIcon, { backgroundColor: `${colors.primary}20` }]}>
                                    <MaterialCommunityIcons name="dumbbell" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.goalContent}>
                                    <Text style={[styles.goalDescription, { color: colors.text }]}>Consistency is key</Text>
                                    <Text style={[styles.goalProgress, { color: colors.textSecondary }]}>Keep your streak alive!</Text>
                                </View>
                            </View>
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
