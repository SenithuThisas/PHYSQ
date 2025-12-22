import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions, Animated } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

import { Config } from '../../constants/Config';
import { Input } from '../../components/Input';
import { UsernameInput } from '../../components/UsernameInput';
import { EmailInput } from '../../components/EmailInput';
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter';
import { validateRequired, validatePassword, getPasswordStrength } from '../../utils/validation';
import { handleApiError } from '../../utils/apiHelper';
import { useShakeAnimation } from '../../utils/animations';

const API_URL = Config.API_URL;

export default function Signup() {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
    const isDesktop = width > 768;
    const { showToast } = useToast();
    const router = useRouter();

    // Form state
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(false);
    const [email, setEmail] = useState('');
    const [emailAvailable, setEmailAvailable] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Touched state for each field
    const [touched, setTouched] = useState({
        fullName: false,
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    // Shake animation for form
    const { shake, style: shakeStyle } = useShakeAnimation();

    // Real-time validation errors
    const getFullNameError = () => {
        if (!touched.fullName || !fullName) return '';
        return validateRequired(fullName) ? '' : 'Full name is required';
    };

    const getPasswordError = () => {
        if (!touched.password || !password) return '';
        const validation = validatePassword(password);
        return validation.isValid ? '' : validation.message || '';
    };

    const getConfirmPasswordError = () => {
        if (!touched.confirmPassword || !confirmPassword) return '';
        return password === confirmPassword ? '' : 'Passwords do not match';
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            fullName.trim().length > 0 &&
            (username.length === 0 || usernameAvailable) && // Username is optional
            emailAvailable &&
            password.length >= 8 &&
            password === confirmPassword
        );
    };

    const handleSignup = async () => {
        // Mark all fields as touched
        setTouched({
            fullName: true,
            username: true,
            email: true,
            password: true,
            confirmPassword: true,
        });

        // Validate all fields
        if (!isFormValid()) {
            shake();
            showToast('Please fix all errors before submitting', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/signup`, {
                fullName,
                email,
                password,
                username: username || undefined
            });
            showToast('Account created successfully!', 'success');
            router.replace('/(auth)/login');
        } catch (err: any) {
            const errorMessage = handleApiError(err);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[
                styles.contentContainer,
                {
                    maxWidth: isDesktop ? 600 : 400,
                    backgroundColor: colors.background,
                    borderColor: colors.primary,
                    shadowColor: colors.primary
                },
                shakeStyle
            ]}>
                <Text style={[styles.header, { color: colors.text }]}>Create Account</Text>
                <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Start your journey to greatness.</Text>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="Gym Bro"
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            if (!touched.fullName) setTouched(prev => ({ ...prev, fullName: true }));
                        }}
                        autoCapitalize="words"
                        error={getFullNameError()}
                    />

                    <UsernameInput
                        value={username}
                        onChangeText={setUsername}
                        onAvailabilityChange={setUsernameAvailable}
                    />

                    <EmailInput
                        value={email}
                        onChangeText={setEmail}
                        onAvailabilityChange={setEmailAvailable}
                    />

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Password"
                                placeholder="Password"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
                                }}
                                isPassword
                                error={getPasswordError()}
                                style={{ marginBottom: 0 }}
                            />
                            <PasswordStrengthMeter password={password} show={touched.password} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Input
                                label="Confirm"
                                placeholder="Confirm pwd"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (!touched.confirmPassword) setTouched(prev => ({ ...prev, confirmPassword: true }));
                                }}
                                isPassword
                                error={getConfirmPasswordError()}
                                style={{ marginBottom: 0 }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                backgroundColor: isFormValid() ? colors.primary : colors.border,
                                shadowColor: colors.primary,
                                opacity: loading ? 0.7 : 1
                            }
                        ]}
                        onPress={handleSignup}
                        disabled={loading || !isFormValid()}
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
            </Animated.View>
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
