import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

import { Config } from '../../constants/Config';

const API_URL = Config.API_URL;

export default function Signup() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signIn } = useAuth();

    const isValidEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSignup = async () => {
        setError(''); // Clear previous errors
        if (!fullName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/signup`, { fullName, email, password });
            Alert.alert('Success', 'Account created successfully! Please login.');
            router.replace('/(auth)/login');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Signup failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.contentContainer, { maxWidth: isDesktop ? 600 : 400 }]}>
                <Text style={styles.header}>Create Account</Text>
                <Text style={styles.subHeader}>Start your journey to greatness.</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.form}>
                    <View>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Gym Bro"
                            placeholderTextColor="#666"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View>
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
                    </View>

                    {/* Passwords Row */}
                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Password"
                                    placeholderTextColor="#666"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Confirm</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Confirm pwd"
                                    placeholderTextColor="#666"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    <FontAwesome name={showConfirmPassword ? "eye" : "eye-slash"} size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={Colors.background} />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
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
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Login</Text>
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
        alignItems: 'center',
        padding: 24,
    },
    contentContainer: {
        width: '100%',
        // Max Width handled dynamically in component
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
        backgroundColor: Colors.background, // Ensure clean layering
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 32, // Reduced from 48
        textAlign: 'center',
    },
    form: {
        gap: 12, // Reduced from 16
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    label: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.text,
        padding: 14, // Reduced from 16
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingRight: 12, // Reduced right padding
    },
    passwordInput: {
        flex: 1,
        padding: 14, // Reduced from 16
        color: Colors.text,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 14, // Reduced from 16
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20, // Reduced from 24
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
        marginTop: 20, // Reduced from 24
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
        marginVertical: 20, // Reduced from 24
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
        padding: 14, // Reduced from 16
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    googleButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
