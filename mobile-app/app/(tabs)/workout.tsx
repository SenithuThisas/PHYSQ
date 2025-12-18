import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Image, ActivityIndicator, Alert, SafeAreaView, FlatList
} from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { getSchedule, updateSchedule } from '../../services/schedule';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WorkoutHub() {
    const { token, user } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    // Schedule State
    const [scheduleType, setScheduleType] = useState<'text' | 'image'>('text');
    const [scheduleText, setScheduleText] = useState('');
    const [scheduleImage, setScheduleImage] = useState<string | null>(null);
    const [isEditingSchedule, setIsEditingSchedule] = useState(false);

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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.header, { color: colors.text }]}>Workout Hub</Text>

                {/* --- SCHEDULE SECTION --- */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>My Schedule</Text>
                        <TouchableOpacity onPress={() => setIsEditingSchedule(!isEditingSchedule)}>
                            <Text style={[styles.editLink, { color: colors.primary }]}>{isEditingSchedule ? 'Cancel' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>

                    {isEditingSchedule && (
                        <View style={[styles.toggleContainer, { backgroundColor: colors.background }]}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, scheduleType === 'text' && [styles.toggleBtnActive, { backgroundColor: colors.surface, borderColor: colors.border }]]}
                                onPress={() => setScheduleType('text')}
                            >
                                <Text style={[styles.toggleText, { color: colors.textSecondary }, scheduleType === 'text' && [styles.toggleTextActive, { color: colors.primary }]]}>Text</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, scheduleType === 'image' && [styles.toggleBtnActive, { backgroundColor: colors.surface, borderColor: colors.border }]]}
                                onPress={() => setScheduleType('image')}
                            >
                                <Text style={[styles.toggleText, { color: colors.textSecondary }, scheduleType === 'image' && [styles.toggleTextActive, { color: colors.primary }]]}>Image</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.scheduleContent}>
                        {loadingSchedule ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <>
                                {scheduleType === 'text' ? (
                                    isEditingSchedule ? (
                                        <TextInput
                                            style={[styles.scheduleInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                            multiline
                                            value={scheduleText}
                                            onChangeText={setScheduleText}
                                            placeholder="Monday: Chest\nTuesday: Back..."
                                            placeholderTextColor={colors.textSecondary}
                                        />
                                    ) : (
                                        <Text style={[styles.scheduleDisplayText, { color: colors.text }]}>{scheduleText || 'No schedule set.'}</Text>
                                    )
                                ) : (
                                    <View>
                                        {scheduleImage ? (
                                            <Image source={{ uri: scheduleImage }} style={styles.scheduleImage} resizeMode="contain" />
                                        ) : (
                                            <Text style={styles.placeholderText}>No image uploaded.</Text>
                                        )}
                                        {isEditingSchedule && (
                                            <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.primary }]} onPress={pickImage}>
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
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveSchedule}>
                            <Text style={styles.saveBtnText}>Save Schedule</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* --- LOG WORKOUT CARD --- */}
                <TouchableOpacity style={[styles.logCard, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={() => router.push('/workout/log')}>
                    <View style={[styles.logIconCircle, { backgroundColor: colors.primary }]}>
                        <FontAwesome5 name="dumbbell" size={24} color={colors.background} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.logCardTitle, { color: colors.text }]}>Log a Workout</Text>
                        <Text style={[styles.logCardSubtitle, { color: colors.textSecondary }]}>Track your sets, reps & progress</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* --- VIEW ALL RECORDS CARD --- */}
                <TouchableOpacity style={[styles.recordsCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/workout/records')}>
                    <View style={styles.recordsIconCircle}>
                        <MaterialIcons name="history" size={26} color={colors.background} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.recordsCardTitle, { color: colors.text }]}>View All My Records</Text>
                        <Text style={[styles.recordsCardSubtitle, { color: colors.textSecondary }]}>See your complete workout history</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: DefaultColors.background,
    },
    container: {
        padding: 24,
        paddingTop: 10,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginBottom: 24,
    },
    card: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: DefaultColors.border,
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
        color: DefaultColors.text,
    },
    editLink: {
        color: DefaultColors.primary,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginBottom: 16,
        marginTop: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: DefaultColors.background,
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
        backgroundColor: DefaultColors.surface,
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    toggleText: {
        color: DefaultColors.textSecondary,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: DefaultColors.primary,
    },
    scheduleContent: {
        minHeight: 100,
        justifyContent: 'center',
    },
    scheduleInput: {
        backgroundColor: DefaultColors.background,
        color: DefaultColors.text,
        padding: 12,
        borderRadius: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    scheduleDisplayText: {
        color: DefaultColors.text,
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
        color: DefaultColors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 20,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: DefaultColors.primary,
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
        backgroundColor: DefaultColors.primary,
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
        backgroundColor: DefaultColors.surface,
        borderRadius: 20,
        padding: 24, // Larger padding for emphasis
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: DefaultColors.primary, // Highlight border
    },
    logIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: DefaultColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    logCardSubtitle: {
        fontSize: 13,
        color: DefaultColors.textSecondary,
    },
    recordsCard: {
        flexDirection: 'row',
        backgroundColor: DefaultColors.surface,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: DefaultColors.border,
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
        color: DefaultColors.text,
    },
    recordsCardSubtitle: {
        fontSize: 13,
        color: DefaultColors.textSecondary,
    },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: DefaultColors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: DefaultColors.border,
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
});
