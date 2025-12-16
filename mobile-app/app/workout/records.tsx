import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    SafeAreaView, TouchableOpacity, Alert
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getWorkoutHistory, deleteWorkout } from '../../services/workouts';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WorkoutRecords() {
    const { token } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

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
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout record?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWorkout(token!, workoutId);
                            // Optimistically remove from state
                            setHistory(prev => prev.filter(item => item._id !== workoutId));
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete workout");
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (workoutId: string) => {
        // Placeholder for edit functionality
        Alert.alert("Coming Soon", "Edit functionality will be available in a future update.");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
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
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Workout Records</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loadingHistory ? (
                    <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View>
                        {history.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="barbell-outline" size={64} color={Colors.textSecondary} />
                                <Text style={styles.emptyText}>No workouts logged yet.</Text>
                                <Text style={styles.emptySubtext}>Start logging your workouts to see them here!</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.recordsCount}>
                                    {history.length} workout{history.length !== 1 ? 's' : ''} logged
                                </Text>
                                {history.map((session, index) => (
                                    <View key={index} style={styles.historyItem}>
                                        <View style={styles.historyContent}>
                                            <View style={styles.historyDateBox}>
                                                <Text style={styles.historyDateDay}>
                                                    {new Date(session.date).getDate()}
                                                </Text>
                                                <Text style={styles.historyDateMonth}>
                                                    {new Date(session.date).toLocaleString('default', { month: 'short' })}
                                                </Text>
                                            </View>
                                            <View style={styles.historyDetails}>
                                                <Text style={styles.historyTitle}>
                                                    {session.templateName || 'Workout'}
                                                </Text>
                                                <Text style={styles.historySubtitle}>
                                                    {session.exercisesPerformed.length} Exercise{session.exercisesPerformed.length !== 1 ? 's' : ''} • {session.exercisesPerformed.map((e: any) => e.exerciseName).join(', ')}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Actions */}
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.actionBtn}
                                                onPress={() => handleEdit(session._id)}
                                            >
                                                <MaterialIcons name="edit" size={20} color={Colors.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.deleteBtn]}
                                                onPress={() => handleDelete(session._id)}
                                            >
                                                <MaterialIcons name="delete-outline" size={20} color={Colors.error || '#FF453A'} />
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
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
        color: Colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: {
        padding: 24,
        paddingTop: 10,
    },
    recordsCount: {
        fontSize: 14,
        color: Colors.textSecondary,
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
        color: Colors.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    historyItem: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    historyContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    historyDateBox: {
        backgroundColor: Colors.background,
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
        color: Colors.text,
    },
    historyDateMonth: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: Colors.primary,
        fontWeight: 'bold',
    },
    historyDetails: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    historySubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
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
});
