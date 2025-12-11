import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { LineChart } from 'react-native-chart-kit';

export default function Progress() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Progress</Text>

            <Text style={styles.chartTitle}>Squat E1RM (lbs)</Text>
            <LineChart
                data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [{ data: [225, 235, 245, 250, 265, 275] }]
                }}
                width={Dimensions.get("window").width - 48}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: Colors.surface,
                    backgroundGradientFrom: Colors.surface,
                    backgroundGradientTo: Colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(204, 255, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.primary }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
            />

            <Text style={styles.chartTitle}>Bench Press E1RM (lbs)</Text>
            <View style={styles.placeholderChart}>
                <Text style={styles.placeholderText}>Not enough data yet</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 32,
    },
    chartTitle: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 12,
    },
    placeholderChart: {
        height: 220,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: Colors.textSecondary,
    }
});
