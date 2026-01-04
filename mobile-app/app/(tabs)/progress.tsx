import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Tab = 'Overview' | 'Exercises' | 'Measures' | 'Photos';
type TimePeriod = '3 Months' | '6 Months' | 'Year-to-Date';
type Metric = 'Duration' | 'Volume' | 'Workouts';

import { useBreakpoints } from '../../hooks/useBreakpoints';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';

export default function Progress() {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('3 Months');
    const [selectedMetric, setSelectedMetric] = useState<Metric>('Duration');
    const { width } = useBreakpoints();

    // Calculate chart width constrained by max width (1280) and padding (48)
    const chartWidth = Math.min(width, 1280) - 48;

    // Mock data - replace with real API calls
    const weeklyMinutes = 0; // Calculate from current week's workouts
    const musclesThisWeek = ['Chest', 'Legs', 'Back']; // From current week's workouts

    // Generate chart data based on selected metric and time period
    const chartData = useMemo(() => {
        const dataPoints = timePeriod === '3 Months' ? 11 : timePeriod === '6 Months' ? 11 : 11;

        if (selectedMetric === 'Duration') {
            return { data: [30, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95], labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11'] };
        } else if (selectedMetric === 'Volume') {
            return { data: [5000, 5200, 5500, 5400, 5800, 6000, 6200, 6100, 6500, 6400, 6800], labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11'] };
        } else {
            return { data: [3, 4, 3, 5, 4, 5, 6, 5, 6, 5, 7], labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11'] };
        }
    }, [selectedMetric, timePeriod]);

    const tabs: Tab[] = ['Overview', 'Exercises', 'Measures', 'Photos'];
    const timePeriods: TimePeriod[] = ['3 Months', '6 Months', 'Year-to-Date'];
    const metrics: { key: Metric; icon: string; label: string }[] = [
        { key: 'Duration', icon: 'time-outline', label: 'Duration' },
        { key: 'Volume', icon: 'bar-chart-outline', label: 'Volume' },
        { key: 'Workouts', icon: 'trending-up', label: 'Workouts' }
    ];

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
                        <Text style={[styles.summaryValue, { color: colors.text }]}>{weeklyMinutes}min</Text>
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
                        <LineChart
                            data={{
                                labels: chartData.labels,
                                datasets: [{ data: chartData.data }]
                            }}
                            width={chartWidth}
                            height={240}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: colors.surface,
                                backgroundGradientFrom: colors.surface,
                                backgroundGradientTo: colors.surface,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                labelColor: (opacity = 1) => colors.textSecondary,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: '6',
                                    strokeWidth: '2',
                                    stroke: '#3B82F6',
                                    fill: '#3B82F6'
                                }
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>

                    {/* Goal Management Section */}
                    <View style={styles.goalSection}>
                        <View style={styles.goalHeader}>
                            <Text style={[styles.goalTitle, { color: colors.text }]}>Suggested Goal</Text>
                            <TouchableOpacity>
                                <Text style={[styles.goalLink, { color: colors.primary }]}>Add a Goal</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
                            <View style={[styles.goalIcon, { backgroundColor: `${colors.primary}20` }]}>
                                <MaterialCommunityIcons name="dumbbell" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.goalContent}>
                                <Text style={[styles.goalDescription, { color: colors.text }]}>3 Workouts per week</Text>
                                <Text style={[styles.goalProgress, { color: colors.textSecondary }]}>0/3 Completed</Text>
                            </View>
                            <TouchableOpacity style={[styles.setGoalBtn, { backgroundColor: colors.primary }]}>
                                <Text style={styles.setGoalText}>Set Goal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* This Week Overview */}
                    <View style={styles.weekOverview}>
                        <Text style={[styles.weekTitle, { color: colors.text }]}>This Week</Text>
                        <Text style={[styles.weekSubtitle, { color: colors.textSecondary }]}>Explore your targeted muscles</Text>

                        {musclesThisWeek.length > 0 ? (
                            <View style={styles.muscleList}>
                                {musclesThisWeek.map((muscle, index) => (
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
