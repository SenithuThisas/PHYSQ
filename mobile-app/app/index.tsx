import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PHYSQ</Text>
            <Text style={styles.subtitle}>Defy Gravity.</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(auth)/login')}
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.primary,
        letterSpacing: 2,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        marginBottom: 48,
        letterSpacing: 1,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: Colors.background,
        fontSize: 18,
        fontWeight: 'bold',
    }
});
