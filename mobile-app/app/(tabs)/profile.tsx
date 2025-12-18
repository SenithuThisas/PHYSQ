import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';

import { Colors as DefaultColors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ProfileEditForm from '../../components/ProfileEditForm';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Config } from '../../constants/Config';

export default function Profile() {
    const { signOut, user, updateUser } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const [view, setView] = useState<'dashboard' | 'edit'>('dashboard');

    const handleLogout = async () => {
        await signOut();
        router.replace('/');
    };

    const pickScheduleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            try {
                // Determine API URL based on config or hardcode if config issue (assuming Config works as imports are correct)
                await axios.put(`${Config.API_URL}/user/profile`, {
                    scheduleImage: base64Img
                });
                await updateUser({ scheduleImage: base64Img });
            } catch (error) {
                console.error("Failed to upload schedule", error);
                alert("Failed to upload schedule");
            }
        }
    };

    if (view === 'edit') {
        return <ProfileEditForm onBack={() => setView('dashboard')} />;
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My page</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.menuButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Profile Summary Card */}
            <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
                <View style={styles.avatarSection}>
                    {user?.profilePicture ? (
                        <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceLight }]}>
                            <Text style={[styles.avatarText, { color: colors.text }]}>{(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.surfaceLight }]} onPress={() => setView('edit')}>
                        <Text style={[styles.editButtonText, { color: colors.text }]}>Edit</Text>
                    </TouchableOpacity>
                </View>
                <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'User'}</Text>
            </View>

            {/* My Schedule Card */}
            <View style={[styles.scheduleCard, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>My Schedule</Text>
                    <TouchableOpacity onPress={pickScheduleImage}>
                        <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                </View>
                {user?.scheduleImage ? (
                    <Image source={{ uri: user.scheduleImage }} style={styles.scheduleImage} resizeMode="cover" />
                ) : (
                    <Text style={[styles.noScheduleText, { color: colors.textSecondary }]}>No schedule set.</Text>
                )}
            </View>

            {/* Weekly Report Card - Placeholder */}
            <View style={[styles.reportCard, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly report</Text>
                    <Text style={[styles.dateRange, { color: colors.textSecondary }]}>15-21 Dec</Text>
                </View>

                <View style={styles.reportRow}>
                    <View style={styles.reportItem}>
                        <Text style={[styles.reportLabel, { color: colors.text }]}>Average sleep time</Text>
                        <Text style={[styles.reportSubLabel, { color: colors.textSecondary }]}>Previous week 8 h 10 m</Text>
                        <Text style={[styles.reportValue, { color: colors.text }]}>9 h 10 m</Text>
                        <Text style={[styles.trendUp, { color: colors.textSecondary }]}>▲ 1 h</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.reportItem}>
                        <Text style={[styles.reportLabel, { color: colors.text }]}>Avg. wake-up time</Text>
                        <Text style={[styles.reportSubLabel, { color: colors.textSecondary }]}>Previous week 10 h</Text>
                        <Text style={[styles.reportValue, { color: colors.text }]}>10 h 40 m</Text>
                        <Text style={[styles.trendUp, { color: colors.textSecondary }]}>▲ 40 m</Text>
                    </View>
                </View>
            </View>

            {/* Badges Card - Placeholder */}
            <TouchableOpacity style={[styles.badgesCard, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Badges</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </View>

                <View style={styles.badgesRow}>
                    <View style={styles.badgeItem}>
                        {/* Placeholder for badge icon */}
                        <View style={styles.badgeIconPlaceholder}>
                            <Ionicons name="walk-outline" size={32} color={colors.textSecondary} />
                        </View>
                        <Text style={[styles.badgeName, { color: colors.text }]}>First walking workout</Text>
                        <Text style={[styles.badgeDate, { color: colors.textSecondary }]}>3 Jun</Text>
                    </View>
                    <View style={styles.badgeItem}>
                        {/* Placeholder for badge icon */}
                        <View style={styles.badgeIconPlaceholder}>
                            <Ionicons name="flame-outline" size={32} color={colors.error} />
                        </View>
                        <Text style={[styles.badgeName, { color: colors.text }]}>First run</Text>
                        <Text style={[styles.badgeDate, { color: colors.textSecondary }]}>17 Sept 2024</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
                <Text style={[styles.logoutRowText, { color: colors.textSecondary }]}>Log out</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DefaultColors.background,
    },
    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    menuButton: {
        padding: 4,
    },
    profileCard: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    scheduleCard: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 24,
        padding: 24,
        minHeight: 100,
        justifyContent: 'center',
    },
    editLink: {
        color: DefaultColors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    scheduleImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 10,
    },
    noScheduleText: {
        color: DefaultColors.textSecondary,
        marginTop: 10,
        fontSize: 14,
    },
    avatarSection: {
        marginBottom: 16,
        position: 'relative',
        alignItems: 'center',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 0,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: DefaultColors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: -40,
        backgroundColor: '#3A3A3C', // Keep a dark float or use surfaceLight
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    reportCard: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 24,
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: DefaultColors.text,
    },
    dateRange: {
        color: DefaultColors.textSecondary,
        fontSize: 14,
    },
    reportRow: {
        flexDirection: 'row',
        marginTop: 16,
    },
    reportItem: {
        flex: 1,
    },
    divider: {
        width: 1,
        backgroundColor: DefaultColors.border,
        marginHorizontal: 16,
    },
    reportLabel: {
        color: DefaultColors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    reportSubLabel: {
        color: DefaultColors.textSecondary,
        fontSize: 12,
        marginBottom: 8,
    },
    reportValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginBottom: 4,
    },
    trendUp: {
        color: DefaultColors.textSecondary,
        fontSize: 14,
    },
    badgesCard: {
        backgroundColor: DefaultColors.surface,
        borderRadius: 24,
        padding: 24,
    },
    badgesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
    },
    badgeItem: {
        alignItems: 'center',
    },
    badgeIconPlaceholder: {
        width: 60,
        height: 60,
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeName: {
        color: DefaultColors.text,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
    },
    badgeDate: {
        color: DefaultColors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
    },
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    logoutRowText: {
        color: DefaultColors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    }
});
