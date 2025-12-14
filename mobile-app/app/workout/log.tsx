import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Modal, SafeAreaView
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { logWorkoutSession } from '../../services/workouts';
import { useRouter } from 'expo-router';

const EXERCISES = [
    'Squat', 'Bench Press', 'Deadlift', 'Overhead Press',
    'Pull Up', 'Dumbbell Row', 'Leg Press', 'Lunge',
    'Bicep Curl', 'Tricep Extension', 'Lateral Raise'
];

export default function LogWorkout() {
    const { token } = useAuth();
    const router = useRouter();

    const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
    const [description, setDescription] = useState('');
    const [sets, setSets] = useState<{ weight: string, reps: string }[]>([{ weight: '', reps: '' }]);
    const [loggingState, setLoggingState] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);

    // Logging Operations
    const addSet = () => {
        setSets([...sets, { weight: '', reps: '' }]);
    };

    const removeSet = (index: number) => {
        const newSets = [...sets];
        newSets.splice(index, 1);
        setSets(newSets);
    };

    const updateSet = (index: number, field: 'weight' | 'reps', value: string) => {
        const newSets = [...sets];
        newSets[index][field] = value;
        setSets(newSets);
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
                duration: 30, // Default duration
                date: new Date()
            };

            await logWorkoutSession(token, sessionData);
            Alert.alert('Success', 'Workout logged successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to log workout');
        } finally {
            setLoggingState(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.header}>Log Workout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    {/* Exercise Selector */}
                    <Text style={styles.label}>Exercise</Text>
                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowExerciseModal(true)}>
                        <Text style={styles.pickerText}>{selectedExercise}</Text>
                        <FontAwesome5 name="chevron-down" size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Description */}
                    <Text style={styles.label}>Description / Notes</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Heavy sets, feeling strong"
                        placeholderTextColor="#666"
                        value={description}
                        onChangeText={setDescription}
                    />

                    {/* Sets Logger */}
                    <Text style={styles.label}>Sets</Text>
                    <View style={styles.setsHeader}>
                        <Text style={styles.headerLabel}>Weight (kg)</Text>
                        <Text style={styles.headerLabel}>Reps</Text>
                        <View style={{ width: 30 }} />
                    </View>

                    {sets.map((set, index) => (
                        <View key={index} style={styles.setRow}>
                            <TextInput
                                style={styles.setInput}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#666"
                                value={set.weight}
                                onChangeText={(v) => updateSet(index, 'weight', v)}
                            />
                            <TextInput
                                style={styles.setInput}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#666"
                                value={set.reps}
                                onChangeText={(v) => updateSet(index, 'reps', v)}
                            />
                            <TouchableOpacity onPress={() => removeSet(index)} style={styles.removeSetBtn}>
                                <Ionicons name="trash-outline" size={20} color="#FF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addSetBtn} onPress={addSet}>
                        <FontAwesome5 name="plus" size={12} color={Colors.primary} />
                        <Text style={styles.addSetText}>Add Set</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.mainButton, loggingState && styles.disabledBtn]}
                        onPress={handleLogWorkout}
                        disabled={loggingState}
                    >
                        {loggingState ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.mainButtonText}>Save Session</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Exercise Modal */}
            <Modal visible={showExerciseModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Exercise</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {EXERCISES.map(ex => (
                                <TouchableOpacity
                                    key={ex}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedExercise(ex);
                                        setShowExerciseModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{ex}</Text>
                                    {selectedExercise === ex && <FontAwesome5 name="check" size={14} color={Colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowExerciseModal(false)}>
                            <Text style={styles.closeBtnText}>Cancel</Text>
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
        backgroundColor: Colors.background,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 10,
    },
    backBtn: {
        marginRight: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    container: {
        padding: 24,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        marginTop: 16,
    },
    pickerTrigger: {
        backgroundColor: Colors.background,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    pickerText: {
        color: Colors.text,
        fontSize: 16,
    },
    input: {
        backgroundColor: Colors.background,
        color: Colors.text,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
    },
    setsHeader: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    headerLabel: {
        flex: 1,
        color: Colors.textSecondary,
        fontSize: 12,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    setInput: {
        flex: 1,
        backgroundColor: Colors.background,
        color: Colors.text,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        textAlign: 'center',
    },
    removeSetBtn: {
        width: 30,
        alignItems: 'center',
    },
    addSetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
    },
    addSetText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    mainButton: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    mainButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        color: Colors.text,
        fontSize: 16,
    },
    closeBtn: {
        marginTop: 16,
        padding: 16,
        alignItems: 'center',
    },
    closeBtnText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});
