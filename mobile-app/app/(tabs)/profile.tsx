import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ProfileEditForm from '../../components/ProfileEditForm';

export default function Profile() {
    const { signOut, user } = useAuth();
    const router = useRouter();
    const [view, setView] = useState<'dashboard' | 'edit'>('dashboard');

    const handleLogout = async () => {
        await signOut();
        router.replace('/');
    };

    if (view === 'edit') {
        return <ProfileEditForm onBack={() => setView('dashboard')} />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My page</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.menuButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            {/* Profile Summary Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatarSection}>
                    {user?.profilePicture ? (
                        <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.editButton} onPress={() => setView('edit')}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
            </View>

            {/* Weekly Report Card - Placeholder */}
            <View style={styles.reportCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Weekly report</Text>
                    <Text style={styles.dateRange}>15-21 Dec</Text>
                </View>

                <View style={styles.reportRow}>
                    <View style={styles.reportItem}>
                        <Text style={styles.reportLabel}>Average sleep time</Text>
                        <Text style={styles.reportSubLabel}>Previous week 8 h 10 m</Text>
                        <Text style={styles.reportValue}>9 h 10 m</Text>
                        <Text style={styles.trendUp}>▲ 1 h</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.reportItem}>
                        <Text style={styles.reportLabel}>Avg. wake-up time</Text>
                        <Text style={styles.reportSubLabel}>Previous week 10 h</Text>
                        <Text style={styles.reportValue}>10 h 40 m</Text>
                        <Text style={styles.trendUp}>▲ 40 m</Text>
                    </View>
                </View>
            </View>

            {/* Badges Card - Placeholder */}
            <TouchableOpacity style={styles.badgesCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Badges</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                </View>

                <View style={styles.badgesRow}>
                    <View style={styles.badgeItem}>
                        {/* Placeholder for badge icon */}
                        <View style={styles.badgeIconPlaceholder}>
                            <Ionicons name="walk-outline" size={32} color={Colors.textSecondary} />
                        </View>
                        <Text style={styles.badgeName}>First walking workout</Text>
                        <Text style={styles.badgeDate}>3 Jun</Text>
                    </View>
                    <View style={styles.badgeItem}>
                        {/* Placeholder for badge icon */}
                        <View style={styles.badgeIconPlaceholder}>
                            <Ionicons name="flame-outline" size={32} color={Colors.error} />
                        </View>
                        <Text style={styles.badgeName}>First run</Text>
                        <Text style={styles.badgeDate}>17 Sept 2024</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
                <Text style={styles.logoutRowText}>Log out</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Deep black background
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
        color: '#FFFFFF',
    },
    menuButton: {
        padding: 4,
    },
    profileCard: {
        backgroundColor: '#1C1C1E', // Dark grey card
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
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
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.text,
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: -40,
        backgroundColor: '#3A3A3C',
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
        color: '#FFFFFF',
    },
    reportCard: {
        backgroundColor: '#1C1C1E',
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
        color: '#FFFFFF',
    },
    dateRange: {
        color: '#8E8E93',
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
        backgroundColor: '#3A3A3C',
        marginHorizontal: 16,
    },
    reportLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    reportSubLabel: {
        color: '#8E8E93',
        fontSize: 12,
        marginBottom: 8,
    },
    reportValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    trendUp: {
        color: '#8E8E93',
        fontSize: 14,
    },
    badgesCard: {
        backgroundColor: '#1C1C1E',
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
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
    },
    badgeDate: {
        color: '#8E8E93',
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
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    }
});
