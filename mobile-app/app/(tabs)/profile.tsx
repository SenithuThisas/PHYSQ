import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Profile() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.email?.[0].toUpperCase() || 'U'}</Text>
                </View>
                <Text style={styles.email}>{user?.email || 'User'}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
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
        marginBottom: 48,
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 60,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    avatarText: {
        fontSize: 40,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.error,
    },
    logoutText: {
        color: Colors.error,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
