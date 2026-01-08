import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from 'react-native';
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
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [hoveredDate, setHoveredDate] = useState<any>(null);

    // Personal Records filters
    const [prSortOrder, setPrSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [prMuscleFilter, setPrMuscleFilter] = useState<string>('All');
    const [showFilterModal, setShowFilterModal] = useState(false);

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
                {/* Workout count indicators: dots (1-4) + fire emojis (every 5) */}
                {level > 0 && dayStat?.count && (
                    <View style={{ flexDirection: 'row', marginTop: 4, gap: 2, alignItems: 'center', height: 10, justifyContent: 'center' }}>
                        {/* Fire emojis - one for every 5 workouts */}
                        {[...Array(Math.floor(dayStat.count / 5))].map((_, i) => (
                            <Text key={`fire-${i}`} style={{ fontSize: 8, lineHeight: 10 }}>🔥</Text>
                        ))}
                        {/* Dots - for remainder (1-4 workouts) */}
                        {[...Array(dayStat.count % 5)].map((_, i) => (
                            <View key={`dot-${i}`} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: borderColor }} />
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [stats]);

    // Render functions for each tab
    const renderOverviewTab = () => {
        return (
            <>
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

                {/* Weekly Summary Card */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>This Week</Text>
                    <LinearGradient
                        colors={['rgba(204, 255, 0, 0.1)', 'rgba(0, 240, 255, 0.05)']}
                        style={{
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#333'
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingVertical: 8 }}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <Text style={{ color: '#888', fontSize: 12 }}>Workouts</Text>
                                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{stats?.weeklySummary?.workouts || 0}</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <Text style={{ color: '#888', fontSize: 12 }}>Minutes</Text>
                                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{stats?.weeklySummary?.minutes || 0}</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <Text style={{ color: '#888', fontSize: 12 }}>XP Earned</Text>
                                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold' }}>{stats?.weeklySummary?.xp || 0}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <MaterialCommunityIcons name="arm-flex" size={16} color="#CCFF00" />
                            <Text style={{ color: '#ccc', fontSize: 13 }}>
                                Top Focus: <Text style={{ color: '#CCFF00', fontWeight: '600' }}>{stats?.weeklySummary?.topMuscle || 'None'}</Text>
                            </Text>
                            {stats?.weeklySummary?.streakActive && (
                                <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="flame" size={14} color="#FF4D4D" />
                                    <Text style={{ color: '#FF4D4D', fontSize: 12, fontWeight: 'bold' }}>Streak Active</Text>
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </View>

                {/* Consistency Metrics */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Consistency Insights</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#333' }}>
                            <Ionicons name="calendar-outline" size={20} color="#00F0FF" style={{ marginBottom: 4 }} />
                            <Text style={{ color: '#00F0FF', fontSize: 20, fontWeight: 'bold' }}>{stats?.consistency?.avgWorkoutsPerWeek || 0}</Text>
                            <Text style={{ color: '#666', fontSize: 11 }}>Avg/Week</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#333' }}>
                            <Ionicons name="trending-up" size={20} color="#CCFF00" style={{ marginBottom: 4 }} />
                            <Text style={{ color: '#CCFF00', fontSize: 14, fontWeight: 'bold' }} numberOfLines={1}>{stats?.consistency?.mostActiveDay || 'N/A'}</Text>
                            <Text style={{ color: '#666', fontSize: 11 }}>Top Day</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#333' }}>
                            <Ionicons name="flash" size={20} color="#FFD700" style={{ marginBottom: 4 }} />
                            <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: 'bold' }}>{stats?.consistency?.longestStreakThisMonth || 0}</Text>
                            <Text style={{ color: '#666', fontSize: 11 }}>Month Best</Text>
                        </View>
                    </View>
                </View>

                {/* Badges Section */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Achievements</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {stats?.badges?.map((badge: any) => (
                            <BadgeItem key={badge.id} badge={badge} />
                        )) || <Text style={{ color: '#666' }}>Complete a workout to unlock badges!</Text>}
                    </ScrollView>
                </View>

                {/* Gamified Activity Calendar */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Activity Calendar</Text>
                    <View style={{ backgroundColor: '#111', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#333' }}>
                        <Calendar
                            current={new Date().toISOString()}
                            key={stats?.currentStreak}
                            dayComponent={({ date, state }) => {
                                if (state === 'disabled' || !date) return <View style={{ height: 48, width: 48 }} />;

                                const dateStr = date.dateString;
                                const dayStat = stats?.dailyStats?.[dateStr];
                                const level = dayStat?.level || 0;

                                let bgColors = ['transparent', 'transparent'];
                                let borderColor = 'transparent';
                                let glow = false;

                                if (level === 1) { borderColor = '#333'; bgColors = ['#222', '#222']; }
                                if (level === 2) { borderColor = '#CCFF00'; bgColors = ['rgba(204, 255, 0, 0.1)', 'rgba(204, 255, 0, 0.05)']; }
                                if (level === 3) { borderColor = '#00F0FF'; bgColors = ['rgba(0, 240, 255, 0.2)', 'rgba(0, 240, 255, 0.1)']; glow = true; }
                                if (level === 4) { borderColor = '#FFD700'; bgColors = ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.1)']; glow = true; }

                                const isSelected = selectedDate?.date === dateStr;
                                if (isSelected) {
                                    borderColor = '#fff';
                                }

                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isSelected) setSelectedDate(null);
                                            else setSelectedDate({
                                                date: dateStr,
                                                level,
                                                bg: bgColors[0],
                                                border: borderColor,
                                                stat: dayStat,
                                                dayObj: new Date(date.timestamp)
                                            });
                                        }}
                                        // @ts-ignore
                                        onMouseEnter={() => level > 0 && setHoveredDate({
                                            date: dateStr,
                                            level,
                                            stat: dayStat,
                                            dayObj: new Date(date.timestamp)
                                        })}
                                        onMouseLeave={() => setHoveredDate(null)}
                                        style={{ alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' }}
                                    >
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
                                        {/* Workout count indicators: dots (1-4) + fire emojis (every 5) */}
                                        {level > 0 && dayStat?.count && (
                                            <View style={{ flexDirection: 'row', marginTop: 4, gap: 2, alignItems: 'center', height: 10, justifyContent: 'center' }}>
                                                {/* Fire emojis - one for every 5 workouts */}
                                                {[...Array(Math.floor(dayStat.count / 5))].map((_, i) => (
                                                    <Text key={`fire-${i}`} style={{ fontSize: 8, lineHeight: 10 }}>🔥</Text>
                                                ))}
                                                {/* Dots - for remainder (1-4 workouts) */}
                                                {[...Array(dayStat.count % 5)].map((_, i) => (
                                                    <View key={`dot-${i}`} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: borderColor }} />
                                                ))}
                                            </View>
                                        )}

                                        {/* Hover Tooltip */}
                                        {hoveredDate?.date === dateStr && level > 0 && (
                                            <View style={{
                                                position: 'absolute',
                                                bottom: 50,
                                                left: '50%',
                                                // @ts-ignore
                                                transform: [{ translateX: '-50%' }],
                                                backgroundColor: '#000',
                                                borderRadius: 8,
                                                padding: 8,
                                                minWidth: 120,
                                                maxWidth: 150,
                                                borderWidth: 1,
                                                borderColor: borderColor || '#333',
                                                zIndex: 1000,
                                                shadowColor: '#000',
                                                shadowOpacity: 0.8,
                                                shadowRadius: 8,
                                                elevation: 15,
                                                pointerEvents: 'none'
                                            }}>
                                                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
                                                    {dayStat?.xp || 0} XP • {dayStat?.count || 1} workout{(dayStat?.count || 1) > 1 ? 's' : ''}
                                                </Text>
                                                {dayStat?.titles && dayStat.titles.length > 0 && (
                                                    <Text style={{ color: '#CCFF00', fontSize: 10, marginBottom: 2, fontWeight: '600' }}>
                                                        {dayStat.titles.join(', ')}
                                                    </Text>
                                                )}
                                                {dayStat?.exercises && dayStat.exercises.length > 0 && (
                                                    <Text style={{ color: '#999', fontSize: 9 }} numberOfLines={3}>
                                                        {dayStat.exercises.slice(0, 5).join(' • ')}
                                                        {dayStat.exercises.length > 5 ? ' ...' : ''}
                                                    </Text>
                                                )}
                                                <View style={{
                                                    position: 'absolute',
                                                    bottom: -6,
                                                    left: '50%',
                                                    marginLeft: -6,
                                                    width: 0,
                                                    height: 0,
                                                    borderLeftWidth: 6,
                                                    borderRightWidth: 6,
                                                    borderTopWidth: 6,
                                                    borderLeftColor: 'transparent',
                                                    borderRightColor: 'transparent',
                                                    borderTopColor: borderColor || '#333'
                                                }} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            theme={{
                                calendarBackground: 'transparent',
                                textSectionTitleColor: '#666',
                                arrowColor: colors.primary,
                                monthTextColor: '#fff',
                                textMonthFontWeight: 'bold',
                                textMonthFontSize: 18,
                                todayTextColor: colors.primary,
                                dayTextColor: '#fff',
                                textDisabledColor: '#333'
                            }}
                            disableMonthChange={false}
                        />
                    </View>

                    {selectedDate && (
                        <View style={{
                            marginTop: 16, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12,
                            borderWidth: 1, borderColor: '#333', flexDirection: 'row', alignItems: 'center', gap: 12
                        }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 8, backgroundColor: selectedDate.bg,
                                borderWidth: 1, borderColor: selectedDate.border === '#fff' ? selectedDate.bg : selectedDate.border,
                                justifyContent: 'center', alignItems: 'center'
                            }}>
                                <Text style={{ fontSize: 16 }}>{selectedDate.level === 4 ? '🏆' : selectedDate.level > 1 ? '🔥' : selectedDate.level === 1 ? '⚡' : '•'}</Text>
                            </View>
                            <View>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{selectedDate.dayObj.toDateString()}</Text>
                                <Text style={{ color: '#888', fontSize: 12 }}>{selectedDate.stat ? `${selectedDate.stat.xp} XP • ${selectedDate.stat.titles?.join(', ') || 'Workout'}` : 'No Details'}</Text>
                            </View>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' }} />
                            <Text style={{ color: '#666', fontSize: 12 }}>Rest</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#CCFF00' }} />
                            <Text style={{ color: '#888', fontSize: 12 }}>Active</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700' }} />
                            <Text style={{ color: '#888', fontSize: 12 }}>Beast</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                {stats?.recentActivity && stats.recentActivity.length > 0 && (
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Recent Workouts</Text>
                        <View style={{ gap: 10 }}>
                            {stats.recentActivity.map((activity: any) => (
                                <TouchableOpacity
                                    key={activity.id}
                                    style={{
                                        backgroundColor: '#111',
                                        borderRadius: 12,
                                        padding: 14,
                                        borderWidth: 1,
                                        borderColor: '#333',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12
                                    }}
                                    onPress={() => {/* Navigate to workout details */ }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                                            {activity.templateName}
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="time-outline" size={12} color="#888" />
                                                <Text style={{ color: '#888', fontSize: 12 }}>{activity.duration} min</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="barbell-outline" size={12} color="#888" />
                                                <Text style={{ color: '#888', fontSize: 12 }}>{activity.exerciseCount} exercises</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="star" size={12} color={colors.primary} />
                                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{activity.xp} XP</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={{ color: '#666', fontSize: 11, textAlign: 'right' }}>
                                        {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

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
            </>
        );
    };

    const renderExercisesTab = () => {
        // Get unique muscle groups from personal records
        const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

        // Filter and sort personal records
        let filteredRecords = stats?.personalRecords || [];

        // Apply muscle filter
        if (prMuscleFilter !== 'All') {
            filteredRecords = filteredRecords.filter((pr: any) => {
                // Get exercise details to find muscle group
                // Assuming the PR object might have a muscle property, or we need to match by exercise name
                return pr.muscle === prMuscleFilter;
            });
        }

        // Sort by date
        filteredRecords = [...filteredRecords].sort((a: any, b: any) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return prSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return (
            <>
                {stats?.personalRecords && stats.personalRecords.length > 0 ? (
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Personal Records 🏆</Text>

                        {/* Filter Icon Button */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ color: '#888', fontSize: 14 }}>
                                {prMuscleFilter !== 'All' ? `${prMuscleFilter} • ` : ''}{prSortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowFilterModal(true)}
                                style={{
                                    padding: 8,
                                    borderRadius: 8,
                                    backgroundColor: '#222',
                                    borderWidth: 1,
                                    borderColor: '#333'
                                }}
                            >
                                <Ionicons name="filter" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Filter Modal */}
                        <Modal
                            visible={showFilterModal}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowFilterModal(false)}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 20
                                }}
                                activeOpacity={1}
                                onPress={() => setShowFilterModal(false)}
                            >
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={(e) => e.stopPropagation()}
                                    style={{
                                        backgroundColor: '#1A1A1A',
                                        borderRadius: 16,
                                        padding: 20,
                                        width: '100%',
                                        maxWidth: 400,
                                        borderWidth: 1,
                                        borderColor: '#333'
                                    }}
                                >
                                    {/* Modal Header */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Filters</Text>
                                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                            <Ionicons name="close" size={24} color="#888" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Sort by Date */}
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{ color: '#888', fontSize: 12, marginBottom: 12, fontWeight: '600' }}>SORT BY</Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <TouchableOpacity
                                                onPress={() => setPrSortOrder('newest')}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 12,
                                                    borderRadius: 12,
                                                    backgroundColor: prSortOrder === 'newest' ? colors.primary : '#222',
                                                    borderWidth: 1,
                                                    borderColor: prSortOrder === 'newest' ? colors.primary : '#333',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text style={{ color: prSortOrder === 'newest' ? '#000' : '#888', fontWeight: '600', fontSize: 14 }}>
                                                    Newest First
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setPrSortOrder('oldest')}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 12,
                                                    borderRadius: 12,
                                                    backgroundColor: prSortOrder === 'oldest' ? colors.primary : '#222',
                                                    borderWidth: 1,
                                                    borderColor: prSortOrder === 'oldest' ? colors.primary : '#333',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text style={{ color: prSortOrder === 'oldest' ? '#000' : '#888', fontWeight: '600', fontSize: 14 }}>
                                                    Oldest First
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Filter by Muscle Group */}
                                    <View>
                                        <Text style={{ color: '#888', fontSize: 12, marginBottom: 12, fontWeight: '600' }}>MUSCLE GROUP</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {muscleGroups.map((muscle) => (
                                                <TouchableOpacity
                                                    key={muscle}
                                                    onPress={() => setPrMuscleFilter(muscle)}
                                                    style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 10,
                                                        borderRadius: 12,
                                                        backgroundColor: prMuscleFilter === muscle ? colors.primary : '#222',
                                                        borderWidth: 1,
                                                        borderColor: prMuscleFilter === muscle ? colors.primary : '#333'
                                                    }}
                                                >
                                                    <Text style={{ color: prMuscleFilter === muscle ? '#000' : '#888', fontWeight: '600', fontSize: 13 }}>
                                                        {muscle}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setPrSortOrder('newest');
                                                setPrMuscleFilter('All');
                                            }}
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#222',
                                                paddingVertical: 14,
                                                borderRadius: 12,
                                                alignItems: 'center',
                                                borderWidth: 1,
                                                borderColor: '#333'
                                            }}
                                        >
                                            <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 15 }}>Reset</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setShowFilterModal(false)}
                                            style={{
                                                flex: 1,
                                                backgroundColor: colors.primary,
                                                paddingVertical: 14,
                                                borderRadius: 12,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 15 }}>Apply Filters</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </Modal>

                        {/* Personal Records List */}
                        {filteredRecords.length > 0 ? (
                            <View style={{ gap: 8 }}>
                                {filteredRecords.map((pr: any, index: number) => (
                                    <View
                                        key={index}
                                        style={{
                                            backgroundColor: '#111',
                                            borderRadius: 12,
                                            padding: 12,
                                            borderWidth: 1,
                                            borderColor: '#333',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 12
                                        }}
                                    >
                                        <View style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: '#222',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{ fontSize: 18 }}>💪</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>{pr.exercise}</Text>
                                            <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                                                {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>
                                                {pr.weight} kg
                                            </Text>
                                            <Text style={{ color: '#666', fontSize: 11 }}>{pr.reps} reps</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                <Text style={{ color: '#666', fontSize: 14 }}>No records found for this filter</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
                        <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                            No personal records yet.{'\n'}Start lifting to set new PRs!
                        </Text>
                    </View>
                )}
            </>
        );
    };

    const renderMeasuresTab = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
                <Text style={{ color: '#666', fontSize: 16 }}>Measures coming soon...</Text>
            </View>
        );
    };

    const renderPhotosTab = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
                <Text style={{ color: '#666', fontSize: 16 }}>Progress photos coming soon...</Text>
            </View>
        );
    };

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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 0 }}>
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>Progress</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {/* Quick Actions */}
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: colors.primary,
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                    onPress={() => {/* Navigate to log workout */ }}
                                >
                                    <Ionicons name="add" size={18} color="#000" />
                                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>Log Workout</Text>
                                </TouchableOpacity>
                                <View style={{ backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Level {stats?.totalWorkouts ? Math.floor(stats.totalWorkouts / 10) + 1 : 1}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Tab Content */}
                        {activeTab === 'Overview' && renderOverviewTab()}
                        {activeTab === 'Exercises' && renderExercisesTab()}
                        {activeTab === 'Measures' && renderMeasuresTab()}
                        {activeTab === 'Photos' && renderPhotosTab()}

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
