import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '../constants/Config';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function StatsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<any>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${Config.API_URL}/user/profile`);
            setHistoryData(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (history: any[], currentUnit: string, type: 'weight' | 'height') => {
        if (!history || history.length === 0) return { labels: [], data: [] };

        // Sort by date ascending
        const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Take last 6 entries for readability, or all if less
        const recent = sorted.slice(-6);

        const labels = recent.map(item => {
            const date = new Date(item.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const data = recent.map(item => {
            let val = item.value;
            // Normalize units
            if (type === 'weight') {
                // Target: currentUnit
                if (currentUnit === 'kg' && item.unit === 'lbs') val = val * 0.453592;
                if (currentUnit === 'lbs' && item.unit === 'kg') val = val / 0.453592;
            } else {
                // Height
                // Not implementing complex height conversion for chart yet, assuming consistent
            }
            return val;
        });

        return { labels, data };
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const weightUnit = historyData?.weight?.unit || 'kg';
    const weightChart = processChartData(historyData?.weightHistory, weightUnit, 'weight');

    // For height, usually it doesn't change much for adults, but we chart it anyway
    const heightUnit = historyData?.height?.unit || 'cm';
    const heightChart = processChartData(historyData?.heightHistory, heightUnit, 'height');

    const chartConfig = {
        backgroundGradientFrom: Colors.surface,
        backgroundGradientTo: Colors.surface,
        color: (opacity = 1) => `rgba(204, 255, 0, ${opacity})`, // Colors.primary
        strokeWidth: 2,
        barPercentage: 0.5,
        decimalPlaces: 1,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: Colors.primary
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Body Statistics</Text>
            </View>

            <View style={styles.content}>

                {/* Weight Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Weight History ({weightUnit})</Text>
                    {weightChart.data.length > 0 ? (
                        <LineChart
                            data={{
                                labels: weightChart.labels,
                                datasets: [{ data: weightChart.data }]
                            }}
                            width={Dimensions.get("window").width - 40 - 32} // screen width - padding
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <Text style={styles.noDataText}>No weight history available</Text>
                    )}
                </View>

                {/* Height Chart - Optional/Less critical for adults but requested */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Height History ({heightUnit})</Text>
                    {heightChart.data.length > 0 ? (
                        <LineChart
                            data={{
                                labels: heightChart.labels,
                                datasets: [{ data: heightChart.data }]
                            }}
                            width={Dimensions.get("window").width - 40 - 32}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <Text style={styles.noDataText}>No height history available</Text>
                    )}
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: Colors.surface,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16
    },
    noDataText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginVertical: 20,
    }
});
