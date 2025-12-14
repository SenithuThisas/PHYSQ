import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Modal, SafeAreaView, Platform, useWindowDimensions
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { logWorkoutSession, getLastSession } from '../../services/workouts';
import { useRouter, useNavigation } from 'expo-router';

// Removed static dimensions


const EXERCISES = [
    'Squat', 'Bench Press', 'Deadlift', 'Overhead Press',
    'Pull Up', 'Dumbbell Row', 'Leg Press', 'Lunge',
    'Bicep Curl', 'Tricep Extension', 'Lateral Raise'
];

export default function LogWorkout() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    const { token } = useAuth();
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

    // History Data
    const [lastSession, setLastSession] = useState<any>(null);
    const [loadingLast, setLoadingLast] = useState(false);

    useEffect(() => {
        if (!token) return;
        const fetchLast = async () => {
            setLoadingLast(true);
            const data = await getLastSession(token, selectedExercise);
            setLastSession(data);
            setLoadingLast(false);
        };
        fetchLast();
    }, [selectedExercise, token]);

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
                date: new Date()
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
        <SafeAreaView style={styles.safeArea}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={handleBack} style={styles.navIcon}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>New Entry</Text>
                <TouchableOpacity onPress={handleLogWorkout} disabled={loggingState}>
                    {loggingState ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.navAction}>SAVE</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.gridContainer, isDesktop && styles.gridDesktop]}>

                    {/* LEFT PANEL: CONTEXT & HISTORY */}
                    <View style={[styles.panelLeft, isDesktop && styles.panelLeftDesktop, { gap: 16 }]}>
                        <TouchableOpacity style={styles.exerciseHeader} onPress={() => setShowExerciseModal(true)}>
                            <View>
                                <Text style={styles.exerciseLabel}>EXERCISE</Text>
                                <View style={styles.exerciseSelector}>
                                    <Text style={styles.exerciseTitle}>{selectedExercise}</Text>
                                    <FontAwesome5 name="chevron-down" size={16} color={Colors.primary} />
                                </View>
                            </View>
                            <View style={styles.exerciseIconBg}>
                                <MaterialCommunityIcons name="dumbbell" size={24} color="#000" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.historyCard}>
                            <View style={styles.historyHeader}>
                                <MaterialCommunityIcons name="history" size={18} color={Colors.textSecondary} />
                                <Text style={styles.historyTitle}>LAST PERFORMANCE</Text>
                            </View>
                            {loadingLast ? (
                                <ActivityIndicator color={Colors.textSecondary} style={{ marginTop: 20 }} />
                            ) : lastSession ? (
                                <View>
                                    <Text style={styles.lastDate}>{new Date(lastSession.date).toDateString()}</Text>
                                    <View style={styles.lastStatsGrid}>
                                        {lastSession.exerciseData.sets.map((s: any, i: number) => (
                                            <View key={i} style={styles.lastStatBadge}>
                                                <Text style={styles.lastStatText}>
                                                    <Text style={{ fontWeight: 'bold', color: Colors.text }}>{s.weight}</Text>kg x {s.reps}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.volumeBadge}>
                                        <Text style={styles.volumeLabel}>MAX E1RM</Text>
                                        <Text style={styles.volumeValue}>
                                            {Math.max(...lastSession.exerciseData.sets.map((s: any) => s.weight * (1 + s.reps / 30))).toFixed(0)} kg
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyHistory}>
                                    <Text style={styles.emptyHistoryText}>No previous data found.</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* RIGHT PANEL: LOGGING INPUTS */}
                    <View style={[styles.panelRight, isDesktop && styles.panelRightDesktop, { gap: 16 }]}>
                        <View style={styles.notesContainer}>
                            <TextInput
                                style={styles.notesInput}
                                placeholder="Add workout notes..."
                                placeholderTextColor={Colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>

                        <View style={styles.setsContainer}>
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
                                        style={styles.inputBox}
                                        keyboardType="numeric"
                                        placeholder="-"
                                        placeholderTextColor={Colors.textSecondary}
                                        value={set.weight}
                                        onChangeText={(v) => updateSet(index, 'weight', v)}
                                    />
                                    <TextInput
                                        style={styles.inputBox}
                                        keyboardType="numeric"
                                        placeholder="-"
                                        placeholderTextColor={Colors.textSecondary}
                                        value={set.reps}
                                        onChangeText={(v) => updateSet(index, 'reps', v)}
                                    />
                                    <TouchableOpacity style={styles.delBtn} onPress={() => removeSet(index)}>
                                        <Ionicons name="close-circle" size={24} color={Colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addBtn} onPress={addSet}>
                                <FontAwesome5 name="plus" size={14} color="#000" />
                                <Text style={styles.addBtnText}>ADD SET</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

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
                                    {selectedExercise === ex && <FontAwesome5 name="check" size={14} color={Colors.primary} />}
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
        backgroundColor: Colors.background,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    navIcon: {
        padding: 4,
    },
    navTitle: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    navAction: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    gridContainer: {
        flexDirection: 'column',
        gap: 24, // Increased gap for better separation
    },
    gridDesktop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    panelLeft: {
        width: '100%',
        // No flex on mobile to allow auto-height
    },
    panelRight: {
        width: '100%',
        // No flex on mobile
    },
    /* Desktop-specific panel overrides injected via JS/StyleSheet flattening if needed, 
       but here we can rely on the fact that we switched gridContainer to row. 
       However, to get the 1:1.5 ratio on desktop, we need to conditionally apply flex styles 
       in the component, OR we can use media queries if we had a library. 
       Since we use inline logic: style={[styles.panelLeft, isDesktop && styles.panelLeftDesktop]} 
    */
    panelLeftDesktop: {
        flex: 1,
    },
    panelRightDesktop: {
        flex: 1.5,
    },
    /* EXERCISE HEADER */
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    exerciseLabel: {
        color: Colors.textSecondary,
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
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32, // Fix vertical alignment
    },
    exerciseIconBg: {
        backgroundColor: Colors.primary,
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
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    emptyHistory: {
        padding: 20,
        alignItems: 'center',
    },
    emptyHistoryText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    lastDate: {
        color: Colors.text,
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
        backgroundColor: Colors.background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    lastStatText: {
        color: Colors.textSecondary,
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
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    volumeValue: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    /* LOGGING AREA */
    notesContainer: {
        marginBottom: 8,
    },
    notesInput: {
        backgroundColor: Colors.surface,
        color: Colors.text,
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    setsContainer: {
        backgroundColor: Colors.surface,
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
        color: Colors.textSecondary,
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
        color: Colors.textSecondary,
        width: 16, // Reduced width
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12, // Ensure font size fits
    },
    inputBox: {
        flex: 1,
        backgroundColor: Colors.background,
        color: Colors.text,
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
        backgroundColor: Colors.primary,
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
        backgroundColor: Colors.surface,
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        maxHeight: '70%',
    },
    modalHeaderTitle: {
        color: Colors.text,
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
        color: Colors.textSecondary,
        fontSize: 16,
    },
    modalOptionTextActive: {
        color: Colors.text,
        fontWeight: 'bold',
    },
    modalClose: {
        marginTop: 20,
        alignItems: 'center',
        padding: 12,
    },
    modalCloseText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});
