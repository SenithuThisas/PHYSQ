import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, useWindowDimensions, ImageBackground } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

import { Config } from '../../constants/Config';

const API_URL = Config.API_URL;

export default function Signup() {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.contentContainer, {
                maxWidth: isDesktop ? 600 : 400,
                backgroundColor: colors.background,
                borderColor: colors.primary,
                shadowColor: colors.primary
            }]}>
                <Text style={[styles.header, { color: colors.text }]}>Create Account</Text>
                <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Start your journey to greatness.</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.form}>
                    <View>
                        <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                            placeholder="Gym Bro"
                            placeholderTextColor={colors.textSecondary}
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                            placeholder="gymbro@example.com"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Passwords Row */}
                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                            <View style={[styles.passwordContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: colors.text }]}
                                    placeholder="Password"
                                    placeholderTextColor={colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Confirm</Text>
                            <View style={[styles.passwordContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Confirm pwd"
                                    placeholderTextColor="#666"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    <FontAwesome name={showConfirmPassword ? "eye" : "eye-slash"} size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleSignup} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <Text style={[styles.buttonText, { color: colors.background }]}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    </View>

                    <TouchableOpacity style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => Alert.alert('Coming Soon', 'Google Auth requires GCP setup!')}>
                        <Text style={[styles.googleButtonText, { color: colors.text }]}>Continue with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.link, { color: colors.primary }]}>Login</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
            );
}

            const styles = StyleSheet.create({
                container: {
                flex: 1,
            backgroundColor: DefaultColors.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
    },
            contentContainer: {
                width: '100%',
            // Max Width handled dynamically in component
            borderWidth: 1,
            borderColor: DefaultColors.primary,
            borderRadius: 24,
            padding: 32,
            shadowColor: DefaultColors.primary,
            shadowOffset: {
                width: 0,
            height: 0,
        },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            backgroundColor: DefaultColors.background,
    },
            header: {
                fontSize: 32,
            fontWeight: 'bold',
            color: DefaultColors.text,
            marginBottom: 8,
            textAlign: 'center',
    },
            subHeader: {
                fontSize: 16,
            color: DefaultColors.textSecondary,
            marginBottom: 32,
            textAlign: 'center',
    },
            form: {
                gap: 12,
    },
            errorText: {
                color: 'red',
            textAlign: 'center',
            marginBottom: 12,
            fontSize: 14,
            fontWeight: '600',
    },
            label: {
                color: DefaultColors.text,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
            marginLeft: 4,
    },
            input: {
                backgroundColor: DefaultColors.surface,
            color: DefaultColors.text,
            padding: 14,
            borderRadius: 16,
            fontSize: 16,
            borderWidth: 1,
            borderColor: DefaultColors.border,
    },
            passwordContainer: {
                flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: DefaultColors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: DefaultColors.border,
            paddingRight: 12,
    },
            passwordInput: {
                flex: 1,
            padding: 14,
            color: DefaultColors.text,
            fontSize: 16,
    },
            eyeIcon: {
                padding: 4,
    },
            button: {
                backgroundColor: DefaultColors.primary,
            padding: 14,
            borderRadius: 16,
            alignItems: 'center',
            marginTop: 20,
            shadowColor: DefaultColors.primary,
            shadowOffset: {width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
    },
            buttonText: {
                color: DefaultColors.background,
            fontSize: 16,
            fontWeight: 'bold',
    },
            footer: {
                flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 20,
    },
            footerText: {
                color: DefaultColors.textSecondary,
    },
            link: {
                color: DefaultColors.primary,
            fontWeight: 'bold',
    },
            dividerContainer: {
                flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 20,
    },
            divider: {
                flex: 1,
            height: 1,
            backgroundColor: DefaultColors.border,
    },
            dividerText: {
                color: DefaultColors.textSecondary,
            marginHorizontal: 16,
            fontSize: 14,
    },
            googleButton: {
                backgroundColor: DefaultColors.surface,
            padding: 14,
            borderRadius: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: DefaultColors.border,
    },
            googleButtonText: {
                color: DefaultColors.text,
            fontSize: 16,
            fontWeight: 'bold',
    }
});
