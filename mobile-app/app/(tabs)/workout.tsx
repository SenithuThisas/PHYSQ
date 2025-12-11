import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function WorkoutHub() {
    const router = useRouter();

    const startNewSession = () => {
        // Navigate to active workout screen with a new session ID or param
        router.push('/workout/active');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Workout</Text>

            <TouchableOpacity style={styles.startCard} onPress={startNewSession}>
                <View style={styles.iconCircle}>
                    <FontAwesome5 name="play" size={24} color={Colors.primary} />
                </View>
                <View>
                    <Text style={styles.startTitle}>Start Empty Session</Text>
                    <Text style={styles.startSubtitle}>Build as you go</Text>
                </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Templates</Text>
            <View style={styles.templateList}>
                <View style={styles.templateCard}>
                    <Text style={styles.templateTitle}>Push Day</Text>
                    <Text style={styles.templateDetails}>5 Exercises • Last: 2 days ago</Text>
                </View>

                {/* Placeholder for more templates */}
                <TouchableOpacity style={styles.addTemplate}>
                    <FontAwesome5 name="plus" size={16} color={Colors.primary} />
                    <Text style={styles.addTemplateText}>Create Template</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 32,
    },
    startCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    startTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    startSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 16,
    },
    templateList: {
        gap: 16,
    },
    templateCard: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    templateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    templateDetails: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    addTemplate: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 16,
        borderStyle: 'dashed',
        gap: 8,
    },
    addTemplateText: {
        color: Colors.primary,
        fontWeight: '600',
    }
});
