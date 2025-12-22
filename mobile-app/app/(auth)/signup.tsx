import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

import { Config } from '../../constants/Config';
import { Input } from '../../components/Input';
import { UsernameInput } from '../../components/UsernameInput';
import { useFormValidation, validateEmail, validateRequired, validatePassword } from '../../utils/validation';
import { handleApiError } from '../../utils/apiHelper';

const API_URL = Config.API_URL;

export default function Signup() {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
    const isDesktop = width > 768;
    const { showToast } = useToast();

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { signIn } = useAuth();

    const { errors, setFieldError, clearErrors } = useFormValidation({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const validateForm = () => {
        clearErrors();
        let isValid = true;

        if (!validateRequired(fullName)) {
            setFieldError('fullName', 'Full Name is required');
            isValid = false;
        }

        if (username && username.length < 3) {
            showToast('Username must be at least 3 characters', 'error');
            isValid = false;
        }

        if (username && !usernameAvailable) {
            showToast('Please choose an available username', 'error');
            isValid = false;
        }

        if (!validateRequired(email)) {
            setFieldError('email', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setFieldError('email', 'Invalid email format');
            isValid = false;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setFieldError('password', passwordValidation.message || 'Invalid password');
            isValid = false;
        }

        if (password !== confirmPassword) {
            setFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Note: Adjust endpoint if needed, assuming /auth/signup based on original code
            const res = await axios.post(`${API_URL}/auth/signup`, {
                fullName,
                email,
                password,
                username: username || undefined
            });
            showToast('Account created successfully! Please login.', 'success');
            router.replace('/(auth)/login');
        } catch (err: any) {
            const errorMessage = handleApiError(err);
            showToast(errorMessage, 'error');
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

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="Gym Bro"
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            setFieldError('fullName', null);
                        }}
                        autoCapitalize="words"
                        error={errors.fullName}
                    />

                    <UsernameInput
                        value={username}
                        onChangeText={setUsername}
                        onAvailabilityChange={setUsernameAvailable}
                    />

                    <Input
                        label="Email"
                        placeholder="gymbro@example.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setFieldError('email', null);
                        }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        error={errors.email}
                    />

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Password"
                                placeholder="Password"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setFieldError('password', null);
                                }}
                                isPassword
                                error={errors.password}
                                style={{ marginBottom: 0 }} // Override container margin for row layout
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Input
                                label="Confirm"
                                placeholder="Confirm pwd"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setFieldError('confirmPassword', null);
                                }}
                                isPassword
                                error={errors.confirmPassword}
                                style={{ marginBottom: 0 }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
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

                    <TouchableOpacity style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => showToast('Google Auth requires GCP setup!', 'info')}>
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
        gap: 8,
    },
    button: {
        backgroundColor: DefaultColors.primary,
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: DefaultColors.primary,
        shadowOffset: { width: 0, height: 4 },
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
