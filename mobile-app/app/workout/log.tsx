import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Modal, SafeAreaView, Platform
} from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { logWorkoutSession } from '../../services/workouts';
import { getCustomExercises, createExercise, updateExercise, deleteExercise, Exercise } from '../../services/exercises';
import { useRouter, useNavigation } from 'expo-router';

// Removed static dimensions


// Enhanced Exercise Data with Muscle Groups
const EXERCISE_DATA = [
    { name: 'Squat', muscle: 'Legs' },
    { name: 'Bench Press', muscle: 'Chest' },
    { name: 'Deadlift', muscle: 'Back' },
    { name: 'Overhead Press', muscle: 'Shoulders' },
    { name: 'Pull Up', muscle: 'Back' },
    { name: 'Dumbbell Row', muscle: 'Back' },
    { name: 'Leg Press', muscle: 'Legs' },
    { name: 'Lunge', muscle: 'Legs' },
    { name: 'Bicep Curl', muscle: 'Arms' },
    { name: 'Tricep Extension', muscle: 'Arms' },
    { name: 'Lateral Raise', muscle: 'Shoulders' },
    { name: 'Chest Fly', muscle: 'Chest' },
    { name: 'Leg Extension', muscle: 'Legs' },
    { name: 'Leg Curl', muscle: 'Legs' },
    { name: 'Calf Raise', muscle: 'Legs' },
    { name: 'Face Pull', muscle: 'Shoulders' },
    { name: 'Hammer Curl', muscle: 'Arms' },
    { name: 'Skullcrusher', muscle: 'Arms' },
];

const MUSCLE_GROUPS = ['All', 'Custom', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

// Helper function to get icon based on muscle group
const getMuscleIcon = (muscle: string): string => {
    switch (muscle) {
        case 'Chest':
            return 'arm-flex';
        case 'Back':
            return 'stretch';
        case 'Legs':
            return 'run';
        case 'Shoulders':
            return 'weight-lifter';
        case 'Arms':
            return 'arm-flex-outline';
        case 'Core':
            return 'yoga';
        default:
            return 'dumbbell';
    }
};

export default function LogWorkout() {
    const { token } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();
    const router = useRouter();
    const navigation = useNavigation();

    const handleBack = () => {
        if (navigation.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)/workout');
        }
    };

    const [selectedExercise, setSelectedExercise] = useState(EXERCISE_DATA[0].name);
    const [description, setDescription] = useState('');
    const [sets, setSets] = useState<{ weight: string, reps: string }[]>([{ weight: '', reps: '' }]);
    const [loggingState, setLoggingState] = useState(false);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
    const [isExerciseSelected, setIsExerciseSelected] = useState(false); // Toggle between search and logging view
    const [loadingExercises, setLoadingExercises] = useState(false);

    // Add Exercise Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseMuscle, setNewExerciseMuscle] = useState(MUSCLE_GROUPS[1]); // Default to something specific like Chest

    // Edit Exercise Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [editExerciseName, setEditExerciseName] = useState('');
    const [editExerciseMuscle, setEditExerciseMuscle] = useState(MUSCLE_GROUPS[1]);

    // Delete Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

    // Load custom exercises on mount
    useEffect(() => {
        loadCustomExercises();
    }, []);

    const loadCustomExercises = async () => {
        if (!token) return;
        setLoadingExercises(true);
        try {
            const exercises = await getCustomExercises(token);
            setCustomExercises(exercises);
        } catch (error) {
            console.error('Failed to load custom exercises:', error);
        } finally {
            setLoadingExercises(false);
        }
    };

    const systemExercises: Exercise[] = EXERCISE_DATA.map(ex => ({ ...ex, isCustom: false }));
    const allExercises: Exercise[] = [...systemExercises, ...customExercises];

    const filteredExercises = allExercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All'
            ? true
            : activeFilter === 'Custom'
                ? ex.isCustom
                : ex.muscle === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleAddCustomExercise = () => {
        if (searchQuery.trim()) {
            setNewExerciseName(searchQuery.trim());
        }
        setShowAddModal(true);
    };

    const saveNewExercise = async () => {
        if (!newExerciseName.trim()) {
            showToast('Please enter an exercise name', 'error');
            return;
        }
        if (!token) return;

        try {
            const newExercise = await createExercise(token, {
                name: newExerciseName.trim(),
                muscle: newExerciseMuscle
            });
            setCustomExercises([newExercise, ...customExercises]);
            setSearchQuery('');
            setShowAddModal(false);
            setNewExerciseName('');

            // Set filter to the muscle group of the newly created exercise
            setActiveFilter(newExerciseMuscle);

            showToast('Exercise created successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to create exercise', 'error');
        }
    };

    const handleEditExercise = (exercise: Exercise) => {
        setEditingExercise(exercise);
        setEditExerciseName(exercise.name);
        setEditExerciseMuscle(exercise.muscle);
        setShowEditModal(true);
    };

    const saveEditExercise = async () => {
        if (!editExerciseName.trim() || !editingExercise?._id) {
            showToast('Please enter an exercise name', 'error');
            return;
        }
        if (!token) return;

        try {
            const updated = await updateExercise(token, editingExercise._id, {
                name: editExerciseName.trim(),
                muscle: editExerciseMuscle
            });
            setCustomExercises(customExercises.map(ex =>
                ex._id === updated._id ? updated : ex
            ));
            setShowEditModal(false);
            setEditingExercise(null);
            showToast('Exercise updated successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to update exercise', 'error');
        }
    };

    const cancelEditExercise = () => {
        setShowEditModal(false);
        setEditingExercise(null);
        setEditExerciseName('');
    };

    const handleDeleteExercise = (exercise: Exercise) => {
        setExerciseToDelete(exercise);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!token || !exerciseToDelete?._id) return;
        try {
            await deleteExercise(token, exerciseToDelete._id);
            setCustomExercises(customExercises.filter(ex => ex._id !== exerciseToDelete._id));
            setShowDeleteModal(false);
            setExerciseToDelete(null);
            showToast('Exercise deleted successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to delete exercise', 'error');
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setExerciseToDelete(null);
    };

    const cancelAddExercise = () => {
        setShowAddModal(false);
        setNewExerciseName('');
    };



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
            {/* Search-Focused Navbar */}
            <View style={styles.navbar}>
                <View style={styles.navContent}>
                    <TouchableOpacity onPress={handleBack} style={styles.navIcon}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <TextInput
                            style={[styles.searchBarInput, { color: colors.text }]}
                            placeholder="Search for exercise"
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity style={styles.navIcon}>
                        <Ionicons name="menu" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {!isExerciseSelected ? (
                    /* SEARCH VIEW - Exercise Selection */
                    <View style={[styles.container, { backgroundColor: colors.background }]}>
                        {/* Muscle Filter Chips */}
                        <View style={{ marginBottom: 16 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {MUSCLE_GROUPS.map(group => (
                                    <TouchableOpacity
                                        key={group}
                                        style={[
                                            styles.filterChip,
                                            { borderColor: colors.border },
                                            activeFilter === group && { backgroundColor: colors.primary, borderColor: colors.primary }
                                        ]}
                                        onPress={() => setActiveFilter(group)}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            { color: colors.textSecondary },
                                            activeFilter === group && { color: '#000', fontWeight: 'bold' }
                                        ]}>{group}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Persistent Create New Button */}
                        <TouchableOpacity
                            style={[styles.createFixedBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                            onPress={() => {
                                setNewExerciseName('');
                                setShowAddModal(true);
                            }}
                        >
                            <View style={[styles.createFixedIcon, { backgroundColor: `${colors.primary}20` }]}>
                                <FontAwesome5 name="plus" size={16} color={colors.primary} />
                            </View>
                            <Text style={[styles.createFixedText, { color: colors.text }]}>Create New Exercise</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        {/* Exercise List */}
                        <View style={{ flex: 1 }}>
                            {loadingExercises && customExercises.length === 0 && (
                                <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
                            )}
                            {filteredExercises.map((ex, index) => (
                                <TouchableOpacity
                                    key={ex._id || index}
                                    style={[styles.exerciseItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => {
                                        setSelectedExercise(ex.name);
                                        setIsExerciseSelected(true);
                                    }}
                                >
                                    <View style={[styles.exerciseIcon, { backgroundColor: `${colors.primary}20` }]}>
                                        <MaterialCommunityIcons name={getMuscleIcon(ex.muscle) as any} size={20} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={[styles.exerciseName, { color: colors.text }]}>{ex.name}</Text>
                                            {ex.isCustom && (
                                                <View style={[styles.customBadge, { backgroundColor: `${colors.primary}30` }]}>
                                                    <Text style={[styles.customBadgeText, { color: colors.primary }]}>Custom</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.exerciseMuscle, { color: colors.textSecondary }]}>{ex.muscle}</Text>
                                    </View>
                                    {ex.isCustom ? (
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => handleEditExercise(ex as Exercise)}>
                                                <Ionicons name="pencil" size={20} color={colors.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteExercise(ex as Exercise)}>
                                                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            ))}


                            {/* Empty State / Add Custom - Always show if searching */}
                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    style={[styles.addCustomBtn, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                                    onPress={handleAddCustomExercise}
                                >
                                    <FontAwesome5 name="plus" size={14} color={colors.primary} />
                                    <Text style={[styles.addCustomBtnText, { color: colors.primary }]}>
                                        Add "{searchQuery}"
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ) : (
                    /* LOGGING VIEW - Record Workout */
                    <View style={[styles.container, { backgroundColor: colors.background }]}>
                        {/* Selected Exercise Header */}
                        <View style={[styles.selectedExerciseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TouchableOpacity
                                style={styles.backToSearchBtn}
                                onPress={() => setIsExerciseSelected(false)}
                            >
                                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                                <Text style={[styles.backToSearchText, { color: colors.primary }]}>Change Exercise</Text>
                            </TouchableOpacity>

                            <View style={styles.selectedExerciseHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.selectedExerciseTitle, { color: colors.text }]}>{selectedExercise}</Text>
                                </View>
                                <View style={[styles.exerciseIconBg, { backgroundColor: colors.primary }]}>
                                    <MaterialCommunityIcons name={getMuscleIcon(allExercises.find(e => e.name === selectedExercise)?.muscle || 'Other') as any} size={24} color="#000" />
                                </View>
                            </View>

                            {/* Date Selector */}
                            <View style={styles.dateSelector}>
                                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateNavBtnSmall}>
                                    <Ionicons name="chevron-back" size={18} color={colors.primary} />
                                </TouchableOpacity>
                                <Text style={[styles.dateTextSmall, { color: colors.text }]}>
                                    {date.toDateString() === new Date().toDateString() ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                                <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateNavBtnSmall}>
                                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Sets Entry */}
                        <View style={[styles.setsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.setsHeaderRow}>
                                <Text style={[styles.colHeader, { color: colors.textSecondary }]}>SET</Text>
                                <Text style={[styles.colHeader, { color: colors.textSecondary }]}>KG</Text>
                                <Text style={[styles.colHeader, { color: colors.textSecondary }]}>REPS</Text>
                                <View style={{ width: 40 }} />
                            </View>

                            {sets.map((set, index) => (
                                <View key={index} style={styles.setRow}>
                                    <Text style={[styles.setIndex, { color: colors.textSecondary }]}>{index + 1}</Text>
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
                                style={[styles.notesInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                placeholder="Add notes (optional)..."
                                placeholderTextColor={colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.saveWorkoutBtn, { backgroundColor: colors.primary }]}
                            onPress={handleLogWorkout}
                            disabled={loggingState}
                        >
                            {loggingState ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.saveWorkoutBtnText}>SAVE WORKOUT</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add Custom Exercise Modal */}
            <Modal
                visible={showAddModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelAddExercise}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeaderTitle}>Add New Exercise</Text>

                        <Text style={styles.inputLabel}>Exercise Name</Text>
                        <TextInput
                            style={[styles.modalInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                            placeholder="e.g. Reverse Fly"
                            placeholderTextColor={colors.textSecondary}
                            value={newExerciseName}
                            onChangeText={setNewExerciseName}
                        />

                        <Text style={styles.inputLabel}>Target Muscle</Text>
                        <View style={styles.muscleSelector}>
                            {MUSCLE_GROUPS.filter(m => m !== 'All' && m !== 'Custom').map(muscle => (
                                <TouchableOpacity
                                    key={muscle}
                                    style={[
                                        styles.modalMuscleChip,
                                        { borderColor: colors.border },
                                        newExerciseMuscle === muscle && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setNewExerciseMuscle(muscle)}
                                >
                                    <Text style={[
                                        styles.modalMuscleText,
                                        { color: colors.textSecondary },
                                        newExerciseMuscle === muscle && { color: '#000', fontWeight: 'bold' }
                                    ]}>{muscle}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelAddExercise}>
                                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={saveNewExercise}>
                                <Text style={styles.modalSaveText}>Save Exercise</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Exercise Modal */}
            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelEditExercise}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeaderTitle}>Edit Exercise</Text>

                        <Text style={styles.inputLabel}>Exercise Name</Text>
                        <TextInput
                            style={[styles.modalInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                            placeholder="e.g. Cable Crossover"
                            placeholderTextColor={colors.textSecondary}
                            value={editExerciseName}
                            onChangeText={setEditExerciseName}
                        />

                        <Text style={styles.inputLabel}>Target Muscle</Text>
                        <View style={styles.muscleSelector}>
                            {MUSCLE_GROUPS.filter(m => m !== 'All' && m !== 'Custom').map(muscle => (
                                <TouchableOpacity
                                    key={muscle}
                                    style={[
                                        styles.modalMuscleChip,
                                        { borderColor: colors.border },
                                        editExerciseMuscle === muscle && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setEditExerciseMuscle(muscle)}
                                >
                                    <Text style={[
                                        styles.modalMuscleText,
                                        { color: colors.textSecondary },
                                        editExerciseMuscle === muscle && { color: '#000', fontWeight: 'bold' }
                                    ]}>{muscle}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelEditExercise}>
                                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={saveEditExercise}>
                                <Text style={styles.modalSaveText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelDelete}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeaderTitle}>Delete Exercise</Text>

                        <Text style={[styles.inputLabel, { marginTop: 8, color: colors.textSecondary }]}>
                            Are you sure you want to delete "{exerciseToDelete?.name}"? This action cannot be undone.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelDelete}>
                                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: '#ff4444' }]} onPress={confirmDelete}>
                                <Text style={styles.modalSaveText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
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
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DefaultColors.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchBarInput: {
        flex: 1,
        fontSize: 16,
        color: DefaultColors.text,
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
    // New Styles for Enhanced Modal
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DefaultColors.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: DefaultColors.background,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    addCustomBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 16,
        gap: 8,
    },
    addCustomBtnText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Exercise List Item Styles
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DefaultColors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    exerciseIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginBottom: 2,
    },
    exerciseMuscle: {
        fontSize: 12,
        color: DefaultColors.textSecondary,
    },
    // Selected Exercise Card Styles
    selectedExerciseCard: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    backToSearchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 6,
    },
    backToSearchText: {
        fontSize: 14,
        fontWeight: '600',
        color: DefaultColors.primary,
    },
    selectedExerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    selectedExerciseTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    // Save Workout Button
    saveWorkoutBtn: {
        backgroundColor: DefaultColors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    saveWorkoutBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    /* CREATE FIXED BTN */
    createFixedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    createFixedIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    createFixedText: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
    },
    /* ADD EXERCISE MODAL STYLES */
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: DefaultColors.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    modalInput: {
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    muscleSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    modalMuscleChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    modalMuscleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalSaveBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSaveText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    customBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    customBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
