import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Image, ActivityIndicator, Alert, Modal, SafeAreaView, Platform
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { getSchedule, updateSchedule } from '../../services/schedule';
import { logWorkoutSession } from '../../services/workouts';
import { useFocusEffect } from 'expo-router';

// Predefined exercises list
const EXERCISES = [
    'Squat', 'Bench Press', 'Deadlift', 'Overhead Press',
    'Pull Up', 'Dumbbell Row', 'Leg Press', 'Lunge',
    'Bicep Curl', 'Tricep Extension', 'Lateral Raise'
];

export default function WorkoutHub() {
    const { token, user } = useAuth();
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    // Schedule State
    const [scheduleType, setScheduleType] = useState<'text' | 'image'>('text');
    const [scheduleText, setScheduleText] = useState('');
    const [scheduleImage, setScheduleImage] = useState<string | null>(null);
    const [isEditingSchedule, setIsEditingSchedule] = useState(false);

    // Workout Logger State
    const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
    const [description, setDescription] = useState('');
    const [sets, setSets] = useState<{ weight: string, reps: string }[]>([{ weight: '', reps: '' }]);
    const [loggingState, setLoggingState] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);

    // Fetch Schedule
    const fetchUserSchedule = useCallback(async () => {
        if (!token) return;
        setLoadingSchedule(true);
        try {
            const data = await getSchedule(token);
            setScheduleType(data.type);
            if (data.type === 'text') {
                setScheduleText(data.content);
            } else {
                setScheduleImage(data.content);
            }
        } catch (error) {
            console.log('Failed to fetch schedule');
        } finally {
            setLoadingSchedule(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchUserSchedule();
        }, [fetchUserSchedule])
    );

    // Schedule Operations
    const handleSaveSchedule = async () => {
        if (!token) return;
        try {
            const content = scheduleType === 'text' ? scheduleText : scheduleImage;
            if (!content) return;

            await updateSchedule(token, scheduleType, content);
            setIsEditingSchedule(false);
            Alert.alert('Success', 'Schedule updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save schedule');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            // Store as base64 data URI
            const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setScheduleImage(uri);
            setScheduleType('image'); // Switch to image mode automatically
        }
    };

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

        // Validate inputs
        const validSets = sets.filter(s => s.weight && s.reps).map(s => ({
            weight: parseFloat(s.weight),
            reps: parseFloat(s.reps)
        }));

        if (validSets.length === 0) {
            Alert.alert('Error', 'Please add at least one valid set (Weight & Reps)');
            return;
        }

        setLoggingState(true);
        try {
            const sessionData = {
                exercisesPerformed: [{
                    exerciseName: selectedExercise,
                    sets: validSets
                }],
                templateName: description || 'Quick Log', // Use description as a pseudo-name/note
                duration: 30, // Default or need a timer? Requirement implies just logging what was done.
                date: new Date()
            };

            await logWorkoutSession(token, sessionData);
            Alert.alert('Success', 'Workout logged successfully!');
            // Reset form
            setSets([{ weight: '', reps: '' }]);
            setDescription('');
        } catch (error) {
            Alert.alert('Error', 'Failed to log workout');
        } finally {
            setLoggingState(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Workout Hub</Text>

                {/* --- SCHEDULE SECTION --- */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>My Schedule</Text>
                        <TouchableOpacity onPress={() => setIsEditingSchedule(!isEditingSchedule)}>
                            <Text style={styles.editLink}>{isEditingSchedule ? 'Cancel' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>

                    {isEditingSchedule && (
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, scheduleType === 'text' && styles.toggleBtnActive]}
                                onPress={() => setScheduleType('text')}
                            >
                                <Text style={[styles.toggleText, scheduleType === 'text' && styles.toggleTextActive]}>Text</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, scheduleType === 'image' && styles.toggleBtnActive]}
                                onPress={() => setScheduleType('image')}
                            >
                                <Text style={[styles.toggleText, scheduleType === 'image' && styles.toggleTextActive]}>Image</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.scheduleContent}>
                        {loadingSchedule ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <>
                                {scheduleType === 'text' ? (
                                    isEditingSchedule ? (
                                        <TextInput
                                            style={styles.scheduleInput}
                                            multiline
                                            value={scheduleText}
                                            onChangeText={setScheduleText}
                                            placeholder="Monday: Chest\nTuesday: Back..."
                                            placeholderTextColor="#666"
                                        />
                                    ) : (
                                        <Text style={styles.scheduleDisplayText}>{scheduleText || 'No schedule set.'}</Text>
                                    )
                                ) : (
                                    <View>
                                        {scheduleImage ? (
                                            <Image source={{ uri: scheduleImage }} style={styles.scheduleImage} resizeMode="contain" />
                                        ) : (
                                            <Text style={styles.placeholderText}>No image uploaded.</Text>
                                        )}
                                        {isEditingSchedule && (
                                            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                                                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                                <Text style={styles.uploadBtnText}>Upload Image</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    {isEditingSchedule && (
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSchedule}>
                            <Text style={styles.saveBtnText}>Save Schedule</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* --- QUICK LOG SECTION --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Quick Log</Text>

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
                            <Text style={styles.mainButtonText}>Log Workout</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        padding: 24,
        paddingTop: 10,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 24,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    editLink: {
        color: Colors.primary,
        fontWeight: '600',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: Colors.surface, // Or a highlight color
        borderWidth: 1,
        borderColor: Colors.border,
    },
    toggleText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: Colors.primary,
    },
    scheduleContent: {
        minHeight: 100,
        justifyContent: 'center',
    },
    scheduleInput: {
        backgroundColor: Colors.background,
        color: Colors.text,
        padding: 12,
        borderRadius: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    scheduleDisplayText: {
        color: Colors.text,
        fontSize: 16,
        lineHeight: 24,
    },
    scheduleImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#000',
    },
    placeholderText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    uploadBtnText: {
        color: '#000', // Assuming primary is bright like lime/yellow
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    saveBtnText: {
        color: '#000',
        fontWeight: 'bold',
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
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
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
