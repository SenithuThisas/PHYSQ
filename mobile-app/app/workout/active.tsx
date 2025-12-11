import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Types
type Set = {
    id: string;
    weight: string;
    reps: string;
    rpe: string;
    completed: boolean;
};

type Exercise = {
    id: string;
    name: string;
    sets: Set[];
};

import { Config } from '../../constants/Config';

const API_URL = Config.API_URL;

export default function ActiveWorkout() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();

    const [duration, setDuration] = useState(0);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const addExercise = () => {
        // Ideally this opens a modal. For simplicity, we add a placeholder.
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name: 'Squat', // Default for demo, should be selectable
            sets: [{ id: Date.now().toString() + 's', weight: '', reps: '', rpe: '', completed: false }]
        };
        setExercises([...exercises, newExercise]);
    };

    const addSet = (exerciseId: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    sets: [...ex.sets, { id: Date.now().toString(), weight: '', reps: '', rpe: '', completed: false }]
                };
            }
            return ex;
        }));
    };

    const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
                };
            }
            return ex;
        }));
    };

    const toggleSetComplete = (exerciseId: string, setId: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
                };
            }
            return ex;
        }));
    };

    const finishWorkout = async () => {
        if (exercises.length === 0) {
            Alert.alert("Empty Workout", "Log some sets first!");
            return;
        }

        setIsSaving(true);
        try {
            // Transform state to API format
            const payload = {
                date: new Date(),
                duration: Math.floor(duration / 60), // minutes
                exercisesPerformed: exercises.map(ex => ({
                    exerciseName: ex.name,
                    sets: ex.sets.filter(s => s.completed).map(s => ({
                        weight: Number(s.weight),
                        reps: Number(s.reps),
                        rpe: Number(s.rpe) || null
                    }))
                })).filter(ex => ex.sets.length > 0)
            };

            await axios.post(`${API_URL}/workouts`, payload);
            Alert.alert("Great Job!", "Workout saved successfully.");
            router.back();
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", "Failed to save workout." + (err.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.timer}>{formatTime(duration)}</Text>
                <TouchableOpacity style={styles.finishButton} onPress={finishWorkout} disabled={isSaving}>
                    <Text style={styles.finishText}>{isSaving ? 'Saving...' : 'Finish'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll}>
                {exercises.map((ex, index) => (
                    <View key={ex.id} style={styles.exerciseCard}>
                        <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            <TouchableOpacity>
                                <FontAwesome5 name="ellipsis-h" size={16} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.setRowHeader}>
                            <Text style={[styles.col, styles.colSet]}>Set</Text>
                            <Text style={[styles.col, styles.colOther]}>lbs</Text>
                            <Text style={[styles.col, styles.colOther]}>Reps</Text>
                            <Text style={[styles.col, styles.colOther]}>RPE</Text>
                            <Text style={[styles.col, styles.colCheck]}>✓</Text>
                        </View>

                        {ex.sets.map((set, i) => (
                            <View key={set.id} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                                <View style={[styles.col, styles.colSet]}>
                                    <Text style={styles.setText}>{i + 1}</Text>
                                </View>
                                <View style={[styles.col, styles.colOther]}>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#555"
                                        value={set.weight}
                                        onChangeText={(val) => updateSet(ex.id, set.id, 'weight', val)}
                                    />
                                </View>
                                <View style={[styles.col, styles.colOther]}>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#555"
                                        value={set.reps}
                                        onChangeText={(val) => updateSet(ex.id, set.id, 'reps', val)}
                                    />
                                </View>
                                <View style={[styles.col, styles.colOther]}>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="-"
                                        placeholderTextColor="#555"
                                        value={set.rpe}
                                        onChangeText={(val) => updateSet(ex.id, set.id, 'rpe', val)}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.col, styles.colCheck, styles.checkButton, set.completed && styles.checkButtonActive]}
                                    onPress={() => toggleSetComplete(ex.id, set.id)}
                                >
                                    <FontAwesome5 name="check" size={12} color={set.completed ? Colors.background : Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(ex.id)}>
                            <Text style={styles.addSetText}>+ Add Set</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
                    <Text style={styles.addExerciseText}>+ Add Exercise</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: Colors.surface,
    },
    timer: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        fontVariant: ['tabular-nums'],
    },
    finishButton: {
        backgroundColor: Colors.success,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    finishText: {
        color: Colors.background,
        fontWeight: 'bold',
    },
    scroll: {
        padding: 16,
    },
    exerciseCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    setRowHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    setRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    setRowCompleted: {
        opacity: 0.5,
    },
    col: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    colSet: { width: 30 },
    colOther: { flex: 1 },
    colCheck: { width: 40 },
    setText: {
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: Colors.background,
        color: Colors.text,
        width: '90%',
        textAlign: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    checkButton: {
        height: 30,
        width: 30,
        borderRadius: 8,
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkButtonActive: {
        backgroundColor: Colors.primary,
    },
    addSetButton: {
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: 8,
    },
    addSetText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    addExerciseButton: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    addExerciseText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
