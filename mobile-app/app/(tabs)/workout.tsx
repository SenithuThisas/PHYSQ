import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Image, ActivityIndicator, Alert, SafeAreaView, FlatList, Modal
} from 'react-native';
import { Colors as DefaultColors } from '../../constants/Colors';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { getSchedules, createSchedule, deleteSchedule, Schedule } from '../../services/schedule';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WorkoutHub() {
    const { token } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    // Schedule State
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Create/Edit State inside Modal
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState<'text' | 'image'>('text');
    const [newTextContent, setNewTextContent] = useState('');
    const [newImageContent, setNewImageContent] = useState<string | null>(null);
    const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);

    const fetchSchedules = useCallback(async () => {
        if (!token) return;
        setLoadingSchedules(true);
        try {
            const data = await getSchedules(token);
            setSchedules(data);
        } catch (error) {
            console.log('Failed to fetch schedules');
        } finally {
            setLoadingSchedules(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchSchedules();
        }, [fetchSchedules])
    );

    const handleSaveSchedule = async () => {
        if (!token || !newTitle.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        const content = newType === 'text' ? newTextContent : newImageContent;
        if (!content) {
            Alert.alert('Error', 'Please add some content');
            return;
        }

        try {
            await createSchedule(token, {
                title: newTitle.trim(),
                type: newType,
                content
            });
            await fetchSchedules();
            resetForm();
            Alert.alert('Success', 'Schedule created!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save schedule');
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!token) return;
        Alert.alert('Delete Schedule', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteSchedule(token, id);
                        fetchSchedules(); // Refresh list
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete');
                    }
                }
            }
        ]);
    };

    const resetForm = () => {
        setIsCreating(false);
        setNewTitle('');
        setNewType('text');
        setNewTextContent('');
        setNewImageContent(null);
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
            setNewImageContent(uri);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedScheduleId(expandedScheduleId === id ? null : id);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.header, { color: colors.text }]}>Workout Hub</Text>

                {/* --- SCHEDULE ENTRY POINT --- */}
                <TouchableOpacity
                    style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowScheduleModal(true)}
                >
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                        <MaterialIcons name="schedule" size={24} color={colors.background} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>My Schedules</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                            {schedules.length} active schedule{schedules.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* --- LOG WORKOUT CARD --- */}
                <TouchableOpacity style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={() => router.push('/workout/log')}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                        <FontAwesome5 name="dumbbell" size={24} color={colors.background} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Log a Workout</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Track your sets, reps & progress</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* --- VIEW ALL RECORDS CARD --- */}
                <TouchableOpacity style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/workout/records')}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                        <MaterialIcons name="history" size={26} color={colors.background} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>View All My Records</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>See your complete workout history</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* --- SCHEDULE MODAL --- */}
            <Modal
                visible={showScheduleModal}
                animationType="slide"
                onRequestClose={() => setShowScheduleModal(false)}
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{isCreating ? 'New Schedule' : 'My Schedules'}</Text>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            {isCreating ? (
                                <TouchableOpacity onPress={resetForm}>
                                    <Text style={[styles.headerBtn, { color: colors.textSecondary }]}>Cancel</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => setIsCreating(true)}>
                                    <Ionicons name="add-circle" size={32} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                                <Text style={[styles.headerBtn, { color: colors.textSecondary, fontWeight: 'bold' }]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isCreating ? (
                        <ScrollView contentContainerStyle={styles.createForm}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                placeholder="e.g. Summer Cut"
                                placeholderTextColor={colors.textSecondary}
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, newType === 'text' && { backgroundColor: colors.primary }]}
                                    onPress={() => setNewType('text')}
                                >
                                    <Text style={[styles.typeBtnText, newType === 'text' && { color: '#000', fontWeight: 'bold' }]}>Text</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, newType === 'image' && { backgroundColor: colors.primary }]}
                                    onPress={() => setNewType('image')}
                                >
                                    <Text style={[styles.typeBtnText, newType === 'image' && { color: '#000', fontWeight: 'bold' }]}>Image</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Content</Text>
                            {newType === 'text' ? (
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                    multiline
                                    placeholder="Monday: Chest..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={newTextContent}
                                    onChangeText={setNewTextContent}
                                />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    {newImageContent ? (
                                        <Image source={{ uri: newImageContent }} style={styles.previewImage} resizeMode="contain" />
                                    ) : (
                                        <View style={[styles.placeholderImage, { borderColor: colors.border }]}>
                                            <Text style={{ color: colors.textSecondary }}>No image selected</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.primary }]} onPress={pickImage}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#000" />
                                        <Text style={styles.uploadBtnText}>Upload Image</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveSchedule}>
                                <Text style={styles.saveBtnText}>Save Schedule</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <FlatList
                            data={schedules}
                            keyExtractor={item => item._id}
                            contentContainerStyle={{ padding: 20 }}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No schedules found. Create one!</Text>
                            }
                            renderItem={({ item }) => (
                                <View style={[styles.scheduleItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <TouchableOpacity
                                        style={styles.scheduleItemHeader}
                                        onPress={() => toggleExpand(item._id)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Ionicons
                                                name={item.type === 'text' ? 'document-text' : 'image'}
                                                size={20}
                                                color={colors.primary}
                                            />
                                            <Text style={[styles.scheduleTitle, { color: colors.text }]}>{item.title}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <TouchableOpacity onPress={() => handleDeleteSchedule(item._id)}>
                                                <Ionicons name="trash-outline" size={20} color={DefaultColors.error} />
                                            </TouchableOpacity>
                                            <Ionicons
                                                name={expandedScheduleId === item._id ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color={colors.textSecondary}
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {expandedScheduleId === item._id && (
                                        <View style={[styles.scheduleContent, { borderTopColor: colors.border }]}>
                                            {item.type === 'text' ? (
                                                <Text style={{ color: colors.text }}>{item.content}</Text>
                                            ) : (
                                                <Image source={{ uri: item.content }} style={styles.scheduleImage} resizeMode="contain" />
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
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
    entryCard: {
        flexDirection: 'row',
        backgroundColor: DefaultColors.surface,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: DefaultColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    cardSubtitle: {
        fontSize: 13,
        color: DefaultColors.textSecondary,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: DefaultColors.border, // Using generic border since theme might not be avail here directly in style sheet
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerBtn: {
        fontSize: 16,
    },
    createForm: {
        padding: 20,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    textArea: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 150,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    typeBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: DefaultColors.surface,
    },
    typeBtnText: {
        color: DefaultColors.textSecondary,
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 10,
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginBottom: 20,
    },
    uploadBtnText: {
        fontWeight: 'bold',
        color: '#000',
    },
    saveBtn: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveBtnText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
    },
    // List Styles
    scheduleItem: {
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    scheduleItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    scheduleContent: {
        padding: 16,
        borderTopWidth: 1,
    },
    scheduleImage: {
        width: '100%',
        height: 200,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});
