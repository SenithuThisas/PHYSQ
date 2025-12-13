import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Config } from '../constants/Config';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Picker Constants
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PADDING_COUNT = Math.floor(VISIBLE_ITEMS / 2);

const WheelPicker = ({ data, onSelect, initialValue }: { data: string[], onSelect: (val: string) => void, initialValue: string }) => {
    const flatListRef = useRef<FlatList>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Initial Scroll
    useEffect(() => {
        const index = data.findIndex(item => item === initialValue);
        if (index !== -1) {
            setSelectedIndex(index);
            // Delay slightly to ensure layout is ready
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                    offset: index * ITEM_HEIGHT,
                    animated: false
                });
            }, 100);
        }
    }, [initialValue]);

    const handleScroll = (ev: any) => {
        const offsetY = ev.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const safeIndex = Math.max(0, Math.min(index, data.length - 1));
        if (selectedIndex !== safeIndex) {
            setSelectedIndex(safeIndex);
        }
    };

    const handleMomentumEnd = (ev: any) => {
        const offsetY = ev.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const safeIndex = Math.max(0, Math.min(index, data.length - 1));
        setSelectedIndex(safeIndex);
        onSelect(data[safeIndex]);

        // Ensure perfect snap visually
        flatListRef.current?.scrollToOffset({
            offset: safeIndex * ITEM_HEIGHT,
            animated: true
        });
    };

    const handleItemPress = (index: number) => {
        flatListRef.current?.scrollToOffset({
            offset: index * ITEM_HEIGHT,
            animated: true
        });
        setSelectedIndex(index);
        onSelect(data[index]);
    };

    return (
        <View style={styles.pickerColumn}>
            <View style={styles.selectionOverlay} />
            <FlatList
                ref={flatListRef}
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <TouchableOpacity
                            style={[styles.pickerItem, { height: ITEM_HEIGHT }]}
                            onPress={() => handleItemPress(index)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingVertical: PADDING_COUNT * ITEM_HEIGHT
                }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleMomentumEnd}
                onScrollEndDrag={handleMomentumEnd}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
            />
        </View>
    );
};

export default function StatsPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<any>(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'weight' | 'height' | null>(null);
    const [updating, setUpdating] = useState(false);

    // Picker Values
    const [pickerVal1, setPickerVal1] = useState('0'); // Int part or Ft
    const [pickerVal2, setPickerVal2] = useState('0'); // Dec part or Inches

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

    const openUpdateModal = (type: 'weight' | 'height') => {
        setModalType(type);

        if (type === 'weight') {
            // Default to current weight
            const val = historyData?.weight?.value || 60;
            const intPart = Math.floor(val).toString();
            // Round to 1 decimal place
            const decPart = Math.round((val - Math.floor(val)) * 10).toString();
            setPickerVal1(intPart);
            setPickerVal2(decPart);
        } else {
            // Default to current height
            const val = historyData?.height?.value || 170;
            const unit = historyData?.height?.unit || 'cm';

            if (unit === 'ft') {
                const ft = Math.floor(val).toString();
                const inch = Math.round((val - Math.floor(val)) * 12).toString();
                setPickerVal1(ft);
                setPickerVal2(inch);
            } else {
                setPickerVal1(Math.round(val).toString());
                setPickerVal2('0');
            }
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        setUpdating(true);
        try {
            const payload: any = {};

            if (modalType === 'weight') {
                const currentUnit = historyData?.weight?.unit || 'kg';
                const finalVal = parseFloat(pickerVal1) + (parseFloat(pickerVal2) / 10);
                payload.weight = {
                    value: finalVal,
                    unit: currentUnit
                };
            } else {
                const currentUnit = historyData?.height?.unit || 'cm';
                let finalVal = 0;
                if (currentUnit === 'ft') {
                    finalVal = parseFloat(pickerVal1) + (parseFloat(pickerVal2) / 12);
                } else {
                    finalVal = parseFloat(pickerVal1);
                }
                payload.height = {
                    value: finalVal,
                    unit: currentUnit
                };
            }

            const response = await axios.put(`${Config.API_URL}/user/profile`, payload);
            setHistoryData(response.data);
            if (updateUser) await updateUser(response.data);

            setModalVisible(false);
            Alert.alert('Success', 'Updated successfully');
        } catch (error) {
            console.error('Failed to update', error);
            Alert.alert('Error', 'Failed to update');
        } finally {
            setUpdating(false);
        }
    };

    const processChartData = (history: any[], currentUnit: string, type: 'weight' | 'height') => {
        if (!history || history.length === 0) return { labels: ["New"], data: [0] };

        // Sort by date ascending
        const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const recent = sorted.slice(-6);

        // If no data, return placeholder
        if (recent.length === 0) return { labels: ["New"], data: [0] };

        const labels = recent.map(item => {
            const date = new Date(item.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const data = recent.map(item => {
            let val = item.value;
            if (type === 'weight') {
                if (currentUnit === 'kg' && item.unit === 'lbs') val = val * 0.453592;
                if (currentUnit === 'lbs' && item.unit === 'kg') val = val / 0.453592;
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
    const heightUnit = historyData?.height?.unit || 'cm';

    // Ensure chart data is never completely empty to prevent crash
    const weightChart = processChartData(historyData?.weightHistory, weightUnit, 'weight');
    const heightChart = processChartData(historyData?.heightHistory, heightUnit, 'height');

    // Data Generators
    const weightInts = Array.from({ length: 400 }, (_, i) => i.toString()); // 0-399
    const weightDecs = Array.from({ length: 10 }, (_, i) => i.toString()); // .0 - .9

    const heightCmInts = Array.from({ length: 250 }, (_, i) => (i + 50).toString()); // 50-299
    const feetInts = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const inchInts = Array.from({ length: 12 }, (_, i) => i.toString());

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Body Statistics</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Weight History ({weightUnit})</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => openUpdateModal('weight')}>
                            <Ionicons name="add" size={20} color={Colors.surface} />
                            <Text style={styles.addButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                    {weightChart.data.length > 0 && weightChart.data[0] !== 0 ? (
                        <LineChart
                            data={{ labels: weightChart.labels, datasets: [{ data: weightChart.data }] }}
                            width={Dimensions.get("window").width - 72}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    ) : <Text style={styles.noDataText}>No weight history available</Text>}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Height History ({heightUnit})</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => openUpdateModal('height')}>
                            <Ionicons name="add" size={20} color={Colors.surface} />
                            <Text style={styles.addButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                    {heightChart.data.length > 0 && heightChart.data[0] !== 0 ? (
                        <LineChart
                            data={{ labels: heightChart.labels, datasets: [{ data: heightChart.data }] }}
                            width={Dimensions.get("window").width - 72}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    ) : <Text style={styles.noDataText}>No height history available</Text>}
                </View>
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Top Bar */}
                        <View style={styles.pillContainer}>
                            <View style={styles.pill}><Text style={styles.pillText}>{new Date().toDateString()}</Text></View>
                        </View>

                        <Text style={styles.modalTitle}>
                            {modalType === 'weight' ? `Weight (${weightUnit})` : `Height (${heightUnit})`}
                        </Text>

                        {/* Picker Area */}
                        <View style={styles.pickerContainer}>
                            {modalType === 'weight' ? (
                                <>
                                    <WheelPicker data={weightInts} initialValue={pickerVal1} onSelect={setPickerVal1} />
                                    <View style={styles.dotContainer}><Text style={styles.dotText}>.</Text></View>
                                    <WheelPicker data={weightDecs} initialValue={pickerVal2} onSelect={setPickerVal2} />
                                </>
                            ) : (
                                heightUnit === 'ft' ? (
                                    <>
                                        <WheelPicker data={feetInts} initialValue={pickerVal1} onSelect={setPickerVal1} />
                                        <View style={styles.dotContainer}><Text style={styles.dotText}>'</Text></View>
                                        <WheelPicker data={inchInts} initialValue={pickerVal2} onSelect={setPickerVal2} />
                                        <View style={styles.dotContainer}><Text style={styles.dotText}>"</Text></View>
                                    </>
                                ) : (
                                    <WheelPicker data={heightCmInts} initialValue={pickerVal1} onSelect={setPickerVal1} />
                                )
                            )}
                        </View>

                        <Text style={styles.footerNote}>
                            The {modalType} you enter will also be shown in your user profile.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={updating}>
                                {updating ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.saveBtnText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    color: (opacity = 1) => `rgba(204, 255, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 1,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.primary }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: Colors.surface },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    content: { padding: 20, gap: 20, paddingBottom: 50 },
    card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, alignItems: 'center' },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textSecondary },
    addButton: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, gap: 4 },
    addButtonText: { color: Colors.surface, fontWeight: 'bold', fontSize: 12 },
    chart: { marginVertical: 8, borderRadius: 16 },
    noDataText: { color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 20 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, alignItems: 'center' },
    pillContainer: { alignItems: 'center', marginBottom: 20 },
    pill: { backgroundColor: '#333', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
    pillText: { color: '#ccc', fontSize: 14, fontWeight: '600' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20, alignSelf: 'flex-start' },

    pickerContainer: { flexDirection: 'row', height: 250, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    pickerColumn: { width: 80, height: 250, overflow: 'hidden' },
    pickerItem: { justifyContent: 'center', alignItems: 'center' },
    pickerItemText: { fontSize: 28, color: '#555', fontWeight: 'bold' },
    pickerItemTextSelected: { fontSize: 32, color: 'white', fontWeight: 'bold' },
    selectionOverlay: { position: 'absolute', top: 100, width: '100%', height: 50, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: -1 },
    dotContainer: { justifyContent: 'center', alignItems: 'center', width: 20, paddingBottom: 8 },
    dotText: { fontSize: 32, color: 'white', fontWeight: 'bold' },

    footerNote: { color: '#666', fontSize: 13, marginBottom: 30, textAlign: 'left', width: '100%' },
    modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 },
    cancelBtn: { flex: 1, padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    cancelBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    saveBtn: { flex: 1, backgroundColor: Colors.primary, padding: 18, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: Colors.surface, fontSize: 18, fontWeight: 'bold' }
});
