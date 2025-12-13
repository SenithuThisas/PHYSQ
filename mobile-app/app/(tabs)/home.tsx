import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWeb = width > 768; // Simple breakpoint for tablet/web

    return (
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, isWeb && styles.webContent]}>
            <View style={[styles.mainWrapper, isWeb && styles.webMainWrapper]}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.username}>{user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Athlete'}</Text>
                    </View>
                    <TouchableOpacity style={styles.avatar}>
                        <Text style={styles.avatarText}>{(user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.gridContainer, isWeb && styles.webGridContainer]}>
                    <View style={[styles.section, isWeb && styles.webSection]}>
                        <Text style={styles.sectionTitle}>Ready to lift?</Text>
                        <TouchableOpacity
                            style={[styles.actionCard, isWeb && styles.webActionCard]}
                            onPress={() => router.push('/(tabs)/workout')}
                        >
                            <Text style={styles.actionTitle}>Start New Session</Text>
                            <Text style={styles.actionSubtitle}>Log your sets and reps</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.section, isWeb && styles.webSection]}>
                        <Text style={styles.sectionTitle}>Recent Progress</Text>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Workouts this week</Text>
                            <Text style={styles.statValue}>0</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    webContent: {
        alignItems: 'center', // Centers the mainWrapper
    },
    mainWrapper: {
        width: '100%',
    },
    webMainWrapper: {
        maxWidth: 1024,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    gridContainer: {
        gap: 32,
    },
    webGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    section: {
        marginBottom: 0, // Handled by gap
    },
    webSection: {
        flex: 1,
        minWidth: 300,
    },
    sectionTitle: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 16,
    },
    actionCard: {
        backgroundColor: Colors.primary,
        padding: 24,
        borderRadius: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        minHeight: 140, // Consistent height
        justifyContent: 'center',
    },
    webActionCard: {
        cursor: 'pointer', // Web hover cursor
    } as any, // Cast to any for web-specific prop
    actionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.background,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.6)',
    },
    statCard: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 140, // Match action card height
        justifyContent: 'center',
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    statValue: {
        color: Colors.text,
        fontSize: 32,
        fontWeight: 'bold',
    }
});
