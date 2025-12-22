import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

import { Config } from '../../constants/Config';
import { Input } from '../../components/Input';
import { useFormValidation, validateEmail, validateRequired } from '../../utils/validation';
import { handleApiError } from '../../utils/apiHelper';

const API_URL = Config.API_URL;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { signIn } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();

    const { errors, setFieldError, clearErrors, hasErrors } = useFormValidation({
        email: '',
        password: ''
    });

    const validateForm = () => {
        clearErrors();
        let isValid = true;

        if (!validateRequired(email)) {
            setFieldError('email', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setFieldError('email', 'Invalid email format');
            isValid = false;
        }

        if (!validateRequired(password)) {
            setFieldError('password', 'Password is required');
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            await signIn(res.data.token, res.data.user);
            showToast('Login successful!', 'success');
            router.replace('/(tabs)/home');
        } catch (err: any) {
            const errorMessage = handleApiError(err);
            showToast(errorMessage, 'error');
            // If it's a validation error from server (400), we could potentially map it to fields if the server returns field-specific errors
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.contentContainer, { backgroundColor: colors.background, borderColor: colors.primary, shadowColor: colors.primary }]}>
                <Text style={[styles.header, { color: colors.text }]}>Welcome Back</Text>
                <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Sign in to continue your progress.</Text>

                <View style={styles.form}>
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

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setFieldError('password', null);
                        }}
                        isPassword
                        error={errors.password}
                    />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <Text style={[styles.buttonText, { color: colors.background }]}>Login</Text>
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
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.link, { color: colors.primary }]}>Sign Up</Text>
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
        maxWidth: 400,
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
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
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
        marginTop: 24,
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
        marginVertical: 24,
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
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    googleButtonText: {
        color: DefaultColors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
