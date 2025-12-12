import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

// IMPORTANT: Update this with your local IP if running on real device
import { Config } from '../../constants/Config';

const API_URL = Config.API_URL;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signIn } = useAuth();

    const isValidEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            await signIn(res.data.token, res.data.user);
            router.replace('/(tabs)/home');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Login failed';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.header}>Welcome Back</Text>
                <Text style={styles.subHeader}>Sign in to continue your progress.</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="gymbro@example.com"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="••••••••"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={Colors.background} />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert('Coming Soon', 'Google Auth requires GCP setup!')}>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center', // Center content horizontally
        padding: 24,
    },
    contentContainer: { // New wrapper for form content
        width: '100%',
        maxWidth: 400, // Limit width for web/tablet
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 24,
        padding: 32,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: Colors.background,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center', // Center text
    },
    subHeader: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 48,
        textAlign: 'center', // Center text
    },
    form: {
        gap: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingRight: 16, // Space for icon
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        color: Colors.text,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    label: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        marginLeft: 4, // Align with input radius
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.text,
        padding: 16,
        borderRadius: 16, // Softer corners
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 16, // Match input radius
        alignItems: 'center',
        marginTop: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: Colors.textSecondary,
    },
    link: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        color: Colors.textSecondary,
        marginHorizontal: 16,
        fontSize: 14,
    },
    googleButton: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    googleButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },

});

