import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const width = useWindowDimensions().width;
    const isWeb = width > 768; // Simple breakpoint for tablet/web

    const calculateBMI = (weight: any, height: any) => {
        if (!weight?.value || !height?.value) return '--';

        let w = weight.value;
        let h = height.value;

        if (weight.unit === 'lbs') w = w * 0.453592;
        if (height.unit === 'ft') h = h * 0.3048;
        else h = h / 100; // cm to m

        const bmi = w / (h * h);
        return bmi.toFixed(1);
    };

    const getBMICategory = (bmiVal: string) => {
        const bmi = parseFloat(bmiVal);
        if (isNaN(bmi)) return '';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const formatHeight = (height: any) => {
        if (!height?.value) return '--';
        if (height.unit === 'ft') {
            const ft = Math.floor(height.value);
            const inch = Math.round((height.value - ft) * 12);
            return `${ft}'${inch}"`;
        }
        return `${height.value} cm`;
    };

    const getBMIColor = (category: string) => {
        if (category === 'Underweight') return '#FFC107'; // Amber/Dark Yellow
        if (category === 'Normal') return Colors.primary;
        if (category === 'Overweight' || category === 'Obese') return Colors.error;
        return Colors.primary;
    };

    const currentBMI = user ? calculateBMI(user.weight, user.height) : '--';
    const currentCategory = getBMICategory(currentBMI);
    const bmiColor = getBMIColor(currentCategory);

    const [weeklyCount, setWeeklyCount] = React.useState(0);
    const { token } = useAuth();

    React.useEffect(() => {
        if (token) {
            import('../../services/workouts').then(({ getWeeklyStats }) => {
                getWeeklyStats(token).then(data => setWeeklyCount(data.count));
            });
        }
    }, [token]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, isWeb && styles.webContent]}>
            <View style={[styles.mainWrapper, isWeb && styles.webMainWrapper]}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.username}>{user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Athlete'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => router.push('/(tabs)/profile')}
                    >
                        {user?.profilePicture ? (
                            <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{(user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase()}</Text>
                        )}
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

                    {/* Body Stats Section */}
                    {user && (

                        <View style={[styles.section, { width: '100%' }]}>
                            <Text style={styles.sectionTitle}>Body Stats</Text>
                            <View style={styles.statsRow}>
                                {/* BMI Card */}
                                <TouchableOpacity
                                    style={[styles.statCard, styles.bmiCard, { backgroundColor: bmiColor, borderColor: bmiColor }]}
                                    onPress={() => router.push('/stats')}
                                >
                                    <View>
                                        <Text style={styles.statLabelLight}>BMI</Text>
                                        <Text style={styles.statValueLight}>
                                            {currentBMI}
                                        </Text>
                                    </View>
                                    <View style={styles.bmiBadge}>
                                        <Text style={styles.bmiBadgeText}>
                                            {currentCategory}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Weight Card */}
                                <TouchableOpacity
                                    style={styles.statCard}
                                    onPress={() => router.push('/stats')}
                                >
                                    <Text style={styles.statLabel}>Weight</Text>
                                    <Text style={styles.statValue}>
                                        {user.weight?.value || '--'} <Text style={styles.unitText}>{user.weight?.unit || 'kg'}</Text>
                                    </Text>
                                </TouchableOpacity>

                                {/* Height Card */}
                                <TouchableOpacity
                                    style={styles.statCard}
                                    onPress={() => router.push('/stats')}
                                >
                                    <Text style={styles.statLabel}>Height</Text>
                                    <Text style={styles.statValue}>
                                        {formatHeight(user.height)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={[styles.section, isWeb && styles.webSection]}>
                        <Text style={styles.sectionTitle}>Recent Progress</Text>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Workouts this week</Text>
                            <Text style={styles.statValue}>{weeklyCount}</Text>
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
        overflow: 'hidden', // Ensure image clips to circle
    },
    avatarImage: {
        width: '100%',
        height: '100%',
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
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 100, // Reduced height for smaller cards
        justifyContent: 'center',
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    bmiCard: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        flex: 1.2, // Slightly wider
        justifyContent: 'space-between',
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statLabelLight: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statValue: {
        color: Colors.text,
        fontSize: 22,
        fontWeight: 'bold',
    },
    statValueLight: {
        color: Colors.background,
        fontSize: 28,
        fontWeight: '900',
    },
    unitText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: 'normal',
    },
    bmiBadge: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    bmiBadgeText: {
        color: Colors.background,
        fontSize: 12,
        fontWeight: '700',
    }
});
