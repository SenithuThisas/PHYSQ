import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Image, ActivityIndicator, Alert, SafeAreaView, FlatList
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { getSchedule, updateSchedule } from '../../services/schedule';
import { getWorkoutHistory } from '../../services/workouts';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WorkoutHub() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    // Schedule State
    const [scheduleType, setScheduleType] = useState<'text' | 'image'>('text');
    const [scheduleText, setScheduleText] = useState('');
    const [scheduleImage, setScheduleImage] = useState<string | null>(null);
    const [isEditingSchedule, setIsEditingSchedule] = useState(false);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchData = useCallback(async () => {
        if (!token) return;

        // Fetch Schedule
        setLoadingSchedule(true);
        try {
            const sched = await getSchedule(token);
            setScheduleType(sched.type);
            if (sched.type === 'text') setScheduleText(sched.content);
            else setScheduleImage(sched.content);
        } catch (error) {
            console.log('Failed to fetch schedule');
        } finally {
            setLoadingSchedule(false);
        }

        // Fetch History
        setLoadingHistory(true);
        try {
            const hist = await getWorkoutHistory(token);
            // Limit to recent 5
            setHistory(hist.slice(0, 5));
        } catch (error) {
            console.log('Failed to fetch history');
        } finally {
            setLoadingHistory(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

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
            const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setScheduleImage(uri);
            setScheduleType('image');
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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

                {/* --- LOG WORKOUT CARD --- */}
                <TouchableOpacity style={styles.logCard} onPress={() => router.push('/workout/log')}>
                    <View style={styles.logIconCircle}>
                        <FontAwesome5 name="dumbbell" size={24} color={Colors.background} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.logCardTitle}>Log a Workout</Text>
                        <Text style={styles.logCardSubtitle}>Track your sets, reps & progress</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* --- VIEW ALL RECORDS CARD --- */}
                <TouchableOpacity style={styles.recordsCard} onPress={() => router.push('/stats')}>
                    <View style={styles.recordsIconCircle}>
                        <MaterialIcons name="history" size={26} color={Colors.background} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.recordsCardTitle}>View All My Records</Text>
                        <Text style={styles.recordsCardSubtitle}>See your complete workout history</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* --- RECENT ACTIVITY SECTION --- */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {loadingHistory ? (
                    <ActivityIndicator color={Colors.primary} />
                ) : (
                    <View>
                        {history.length === 0 ? (
                            <Text style={styles.placeholderText}>No workouts logged yet.</Text>
                        ) : (
                            history.map((session, index) => (
                                <View key={index} style={styles.historyItem}>
                                    <View style={styles.historyDateBox}>
                                        <Text style={styles.historyDateDay}>{new Date(session.date).getDate()}</Text>
                                        <Text style={styles.historyDateMonth}>{new Date(session.date).toLocaleString('default', { month: 'short' })}</Text>
                                    </View>
                                    <View style={styles.historyDetails}>
                                        <Text style={styles.historyTitle}>{session.templateName || 'Workout'}</Text>
                                        <Text style={styles.historySubtitle}>
                                            {session.exercisesPerformed.length} Exercises • {session.exercisesPerformed.map((e: any) => e.exerciseName).join(', ')}
                                        </Text>
                                    </View>
                                </View>
                            ))
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
        marginTop: 8,
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
        backgroundColor: Colors.surface,
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
        marginTop: 20,
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
        color: '#000',
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
    logCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 24, // Larger padding for emphasis
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.primary, // Highlight border
    },
    logIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    logCardSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    recordsCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    recordsIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(204, 255, 0, 0.2)', // Lighter primary color
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    recordsCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    recordsCardSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
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
});
