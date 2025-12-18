import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Modal, SafeAreaView, Platform
} from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { logWorkoutSession } from '../../services/workouts';
import { useRouter, useNavigation } from 'expo-router';

// Removed static dimensions


const EXERCISES = [
    'Squat', 'Bench Press', 'Deadlift', 'Overhead Press',
    'Pull Up', 'Dumbbell Row', 'Leg Press', 'Lunge',
    'Bicep Curl', 'Tricep Extension', 'Lateral Raise'
];

export default function LogWorkout() {
    const { token } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const navigation = useNavigation();

    const handleBack = () => {
        if (navigation.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)/workout');
        }
    };

    const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
    const [description, setDescription] = useState('');
    const [sets, setSets] = useState<{ weight: string, reps: string }[]>([{ weight: '', reps: '' }]);
    const [loggingState, setLoggingState] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);



    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        setSets([...sets, { weight: lastSet?.weight || '', reps: lastSet?.reps || '' }]);
    };

    const removeSet = (index: number) => {
        if (sets.length > 1) {
            const newSets = [...sets];
            newSets.splice(index, 1);
            setSets(newSets);
        }
    };

    const updateSet = (index: number, field: 'weight' | 'reps', value: string) => {
        const newSets = [...sets];
        newSets[index][field] = value;
        setSets(newSets);
    };

    const [date, setDate] = useState(new Date());

    const changeDate = (days: number) => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        setDate(newDate);
    };

    const handleLogWorkout = async () => {
        if (!token) return;
        const validSets = sets.filter(s => s.weight && s.reps).map(s => ({
            weight: parseFloat(s.weight),
            reps: parseFloat(s.reps)
        }));

        if (validSets.length === 0) {
            Alert.alert('Error', 'Please add at least one valid set');
            return;
        }

        setLoggingState(true);
        try {
            const sessionData = {
                exercisesPerformed: [{
                    exerciseName: selectedExercise,
                    sets: validSets
                }],
                templateName: description || 'Quick Log',
                duration: 30,
                date: date // Use the selected date
            };

            await logWorkoutSession(token, sessionData);
            Alert.alert('Success', 'Workout logged successfully!', [
                { text: 'Done', onPress: handleBack }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to log workout');
        } finally {
            setLoggingState(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <View style={styles.navContent}>
                    <TouchableOpacity onPress={handleBack} style={styles.navIcon}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.navTitle, { color: colors.text }]}>New Entry</Text>
                    <TouchableOpacity onPress={handleLogWorkout} disabled={loggingState}>
                        {loggingState ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.navAction}>SAVE</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Record Workout Card with Date */}
                    <View style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.recordCardHeader}>
                            <Text style={[styles.recordCardTitle, { color: colors.text }]}>Record workout</Text>
                            <View style={styles.dateSelector}>
                                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateNavBtnSmall}>
                                    <Ionicons name="chevron-back" size={18} color={colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.dateTextSmall}>
                                    {date.toDateString() === new Date().toDateString() ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                                <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateNavBtnSmall}>
                                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Exercise Selector */}
                        <TouchableOpacity style={styles.exerciseHeader} onPress={() => setShowExerciseModal(true)}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.exerciseSelector}>
                                    <Text style={[styles.exerciseTitle, { color: colors.text }]}>{selectedExercise}</Text>
                                    <FontAwesome5 name="chevron-down" size={16} color={colors.primary} />
                                </View>
                            </View>
                            <View style={styles.exerciseIconBg}>
                                <MaterialCommunityIcons name="dumbbell" size={24} color="#000" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Sets Entry */}

                    <View style={[styles.setsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.setsHeaderRow}>
                            <Text style={styles.colHeader}>SET</Text>
                            <Text style={styles.colHeader}>KG</Text>
                            <Text style={styles.colHeader}>REPS</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {sets.map((set, index) => (
                            <View key={index} style={styles.setRow}>
                                <Text style={styles.setIndex}>{index + 1}</Text>
                                <TextInput
                                    style={[styles.inputBox, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.textSecondary}
                                    value={set.weight}
                                    onChangeText={(v) => updateSet(index, 'weight', v)}
                                />
                                <TextInput
                                    style={[styles.inputBox, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.textSecondary}
                                    value={set.reps}
                                    onChangeText={(v) => updateSet(index, 'reps', v)}
                                />
                                <TouchableOpacity style={styles.delBtn} onPress={() => removeSet(index)}>
                                    <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={addSet}>
                            <FontAwesome5 name="plus" size={14} color="#000" />
                            <Text style={styles.addBtnText}>ADD SET</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Workout Notes */}
                    <View style={styles.notesContainer}>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add notes (optional)..."
                            placeholderTextColor={colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>

                    {/* Last Performance */}

                </View>
            </ScrollView>

            {/* MODAL */}
            <Modal visible={showExerciseModal} animationType="fade" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeaderTitle}>Select Exercise</Text>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {EXERCISES.map(ex => (
                                <TouchableOpacity
                                    key={ex}
                                    style={[styles.modalOption, selectedExercise === ex && styles.modalOptionActive]}
                                    onPress={() => {
                                        setSelectedExercise(ex);
                                        setShowExerciseModal(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, selectedExercise === ex && styles.modalOptionTextActive]}>{ex}</Text>
                                    {selectedExercise === ex && <FontAwesome5 name="check" size={14} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowExerciseModal(false)}>
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: DefaultColors.background,
    },
    navbar: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    navContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 700,
    },
    navIcon: {
        padding: 4,
    },
    navTitle: {
        color: DefaultColors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    navAction: {
        color: DefaultColors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    container: {
        gap: 16,
        width: '100%',
        maxWidth: 700,
        alignSelf: 'center',
    },
    /* Record Workout Card */
    recordCard: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 16,
    },
    recordCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    recordCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateNavBtnSmall: {
        padding: 4,
    },
    dateTextSmall: {
        color: DefaultColors.primary,
        fontSize: 14,
        fontWeight: '600',
        minWidth: 60,
        textAlign: 'center',
    },

    /* EXERCISE HEADER */
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
    },
    exerciseLabel: {
        color: DefaultColors.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    exerciseSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    exerciseTitle: {
        color: DefaultColors.text,
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32, // Fix vertical alignment
    },
    exerciseIconBg: {
        backgroundColor: DefaultColors.primary,
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /* HISTORY CARD */
    historyCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    historyTitle: {
        color: DefaultColors.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    emptyHistory: {
        padding: 20,
        alignItems: 'center',
    },
    emptyHistoryText: {
        color: DefaultColors.textSecondary,
        fontStyle: 'italic',
    },
    lastDate: {
        color: DefaultColors.text,
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 12,
    },
    lastStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    lastStatBadge: {
        backgroundColor: DefaultColors.background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    lastStatText: {
        color: DefaultColors.textSecondary,
        fontSize: 13,
    },
    volumeBadge: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(204, 255, 0, 0.05)',
        padding: 12,
        borderRadius: 12,
    },
    volumeLabel: {
        color: DefaultColors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    volumeValue: {
        color: DefaultColors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    /* LOGGING AREA */
    notesContainer: {
        marginBottom: 8,
    },
    notesInput: {
        backgroundColor: DefaultColors.surface,
        color: DefaultColors.text,
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    setsContainer: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    setsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    colHeader: {
        flex: 1,
        color: DefaultColors.textSecondary,
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8, // Reduced gap
    },
    setIndex: {
        color: DefaultColors.textSecondary,
        width: 16, // Reduced width
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12, // Ensure font size fits
    },
    inputBox: {
        flex: 1,
        backgroundColor: DefaultColors.background,
        color: DefaultColors.text,
        padding: 12, // Slight reduce padding
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        minWidth: 60, // Ensure it doesn't shrink too much
    },
    delBtn: {
        width: 40,
        alignItems: 'center',
    },
    addBtn: {
        backgroundColor: DefaultColors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
        gap: 8,
    },
    addBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    /* MODAL */
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: DefaultColors.surface,
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        maxHeight: '70%',
    },
    modalHeaderTitle: {
        color: DefaultColors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    modalOptionActive: {
        backgroundColor: 'rgba(204, 255, 0, 0.05)',
    },
    modalOptionText: {
        color: DefaultColors.textSecondary,
        fontSize: 16,
    },
    modalOptionTextActive: {
        color: DefaultColors.text,
        fontWeight: 'bold',
    },
    modalClose: {
        marginTop: 20,
        alignItems: 'center',
        padding: 12,
    },
    modalCloseText: {
        color: DefaultColors.textSecondary,
        fontSize: 16,
    },
});
