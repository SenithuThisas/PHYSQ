import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';

export default function Progress() {
    const { colors } = useTheme();
    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.header, { color: colors.text }]}>Progress</Text>

            <Text style={[styles.chartTitle, { color: colors.text }]}>Squat E1RM (lbs)</Text>
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
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(204, 255, 0, ${opacity})`,
                    labelColor: (opacity = 1) => colors.text,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
            />

            <Text style={[styles.chartTitle, { color: colors.text }]}>Bench Press E1RM (lbs)</Text>
            <View style={[styles.placeholderChart, { backgroundColor: colors.surface }]}>
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>Not enough data yet</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DefaultColors.background,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginBottom: 32,
    },
    chartTitle: {
        fontSize: 18,
        color: DefaultColors.text,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 12,
    },
    placeholderChart: {
        height: 220,
        backgroundColor: DefaultColors.surface,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: DefaultColors.textSecondary,
    }
});
