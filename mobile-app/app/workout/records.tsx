import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    SafeAreaView, TouchableOpacity, Alert, Modal, TextInput
} from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getWorkoutHistory, deleteWorkout, updateWorkout } from '../../services/workouts';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WorkoutRecords() {
    const { token } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState<any>(null);
    const [editTemplateName, setEditTemplateName] = useState('');
    const [editDate, setEditDate] = useState('');

    // Delete Modal State
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!token) return;

        setLoadingHistory(true);
        try {
            const hist = await getWorkoutHistory(token);
            // Show ALL history, not just recent 5
            setHistory(hist);
        } catch (error) {
            console.log('Failed to fetch history');
        } finally {
            setLoadingHistory(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    const handleDelete = (workoutId: string) => {
        setWorkoutToDelete(workoutId);
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!token || !workoutToDelete) return;

        try {
            await deleteWorkout(token, workoutToDelete);
            // Optimistically remove from state
            setHistory(prev => prev.filter(item => item._id !== workoutToDelete));
            setIsDeleteModalVisible(false);
            setWorkoutToDelete(null);
            // Short toast or simple alert to confirm
            // Alert.alert("Success", "Workout deleted"); 
        } catch (error) {
            Alert.alert("Error", "Failed to delete workout");
        }
    };

    const handleEdit = (workout: any) => {
        setEditingWorkout(workout);
        setEditTemplateName(workout.templateName || '');
        setEditDate(new Date(workout.date).toISOString().split('T')[0]);
        setIsEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!token || !editingWorkout) return;

        try {
            const updatedData = {
                templateName: editTemplateName,
                date: editDate,
                exercisesPerformed: editingWorkout.exercisesPerformed
            };

            const updatedWorkout = await updateWorkout(token, editingWorkout._id, updatedData);

            // Update local state
            setHistory(prev => prev.map(item =>
                item._id === editingWorkout._id ? updatedWorkout : item
            ));

            setIsEditModalVisible(false);
            Alert.alert('Success', 'Workout updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update workout');
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/(tabs)/workout');
                        }
                    }}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Workout Records</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loadingHistory ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View>
                        {history.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="barbell-outline" size={64} color={colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: colors.text }]}>No workouts logged yet.</Text>
                                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Start logging your workouts to see them here!</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={[styles.recordsCount, { color: colors.textSecondary }]}>
                                    {history.length} workout{history.length !== 1 ? 's' : ''} logged
                                </Text>
                                {history.map((session, index) => (
                                    <View key={index} style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                        <View style={styles.historyContent}>
                                            <View style={[styles.historyDateBox, { backgroundColor: colors.background }]}>
                                                <Text style={[styles.historyDateDay, { color: colors.text }]}>
                                                    {new Date(session.date).getDate()}
                                                </Text>
                                                <Text style={[styles.historyDateMonth, { color: colors.primary }]}>
                                                    {new Date(session.date).toLocaleString('default', { month: 'short' })}
                                                </Text>
                                            </View>
                                            <View style={styles.historyDetails}>
                                                <Text style={[styles.historyTitle, { color: colors.text }]}>
                                                    {session.templateName || 'Workout'}
                                                </Text>
                                                <Text style={[styles.historySubtitle, { color: colors.textSecondary }]}>
                                                    {session.exercisesPerformed.length} Exercise{session.exercisesPerformed.length !== 1 ? 's' : ''} • {session.exercisesPerformed.map((e: any) => e.exerciseName).join(', ')}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Actions */}
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, { backgroundColor: colors.surfaceLight || 'rgba(255,255,255,0.05)' }]}
                                                onPress={() => handleEdit(session)}
                                            >
                                                <MaterialIcons name="edit" size={20} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.deleteBtn]}
                                                onPress={() => handleDelete(session._id)}
                                            >
                                                <MaterialIcons name="delete-outline" size={20} color={colors.error || '#FF453A'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Workout</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Workout Name */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Workout Name</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        borderColor: colors.border
                                    }]}
                                    value={editTemplateName}
                                    onChangeText={setEditTemplateName}
                                    placeholder="e.g., Push Day, Leg Day"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            {/* Date */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        borderColor: colors.border
                                    }]}
                                    value={editDate}
                                    onChangeText={setEditDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                                    Format: YYYY-MM-DD (e.g., 2024-12-16)
                                </Text>
                            </View>

                            {/* Exercises Info (Read-only for now) */}
                            {editingWorkout && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Exercises</Text>
                                    <View style={[styles.exercisesList, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        {editingWorkout.exercisesPerformed.map((exercise: any, idx: number) => (
                                            <Text key={idx} style={[styles.exerciseItem, { color: colors.text }]}>
                                                • {exercise.exerciseName} ({exercise.sets.length} sets)
                                            </Text>
                                        ))}
                                    </View>
                                    <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                                        Exercise details can't be edited yet
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Modal Actions */}
                        <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: colors.background }]}
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn, { backgroundColor: colors.primary }]}
                                onPress={handleSaveEdit}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.background }]}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={isDeleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, maxWidth: 350 }]}>
                        <View style={[styles.modalHeader, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <View style={{
                                    width: 60, height: 60, borderRadius: 30,
                                    backgroundColor: 'rgba(255, 69, 58, 0.1)',
                                    justifyContent: 'center', alignItems: 'center', marginBottom: 16
                                }}>
                                    <MaterialIcons name="delete-outline" size={32} color={colors.error || '#FF453A'} />
                                </View>
                                <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>Delete Workout?</Text>
                            </View>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 16 }}>
                                Are you sure you want to delete this workout? This action cannot be undone.
                            </Text>
                        </View>

                        <View style={[styles.modalActions, { borderTopWidth: 0 }]}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.surfaceLight || 'rgba(255,255,255,0.05)' }]}
                                onPress={() => setIsDeleteModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.error || '#FF453A' }]}
                                onPress={confirmDelete}
                            >
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: DefaultColors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: DefaultColors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: {
        padding: 24,
        paddingTop: 10,
    },
    recordsCount: {
        fontSize: 14,
        color: DefaultColors.textSecondary,
        marginBottom: 16,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
        gap: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: DefaultColors.textSecondary,
        textAlign: 'center',
    },
    historyItem: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: DefaultColors.border,
        overflow: 'hidden',
    },
    historyContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    historyDateBox: {
        backgroundColor: DefaultColors.background,
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        marginRight: 16,
    },
    historyDateDay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    historyDateMonth: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: DefaultColors.primary,
        fontWeight: 'bold',
    },
    historyDetails: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginBottom: 4,
    },
    historySubtitle: {
        fontSize: 12,
        color: DefaultColors.textSecondary,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    actionBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    deleteBtn: {
        backgroundColor: 'rgba(255,69,58,0.1)',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: DefaultColors.surface,
        borderRadius: 20,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: DefaultColors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: DefaultColors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: DefaultColors.background,
        color: DefaultColors.text,
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    inputHint: {
        fontSize: 12,
        color: DefaultColors.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    exercisesList: {
        backgroundColor: DefaultColors.background,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    exerciseItem: {
        fontSize: 14,
        color: DefaultColors.text,
        marginBottom: 6,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: DefaultColors.border,
    },
    modalBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: DefaultColors.background,
    },
    saveBtn: {
        backgroundColor: DefaultColors.primary,
    },
    modalBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
