import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

import { Config } from '../../constants/Config';
import { Input } from '../../components/Input';
import { validateEmail, validateRequired } from '../../utils/validation';
import { handleApiError } from '../../utils/apiHelper';
import { useShakeAnimation } from '../../utils/animations';

const API_URL = Config.API_URL;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { signIn } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();

    // Touched state
    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    // Shake animation
    const { shake, style: shakeStyle } = useShakeAnimation();

    // Real-time validation
    const getEmailError = () => {
        if (!touched.email || !email) return '';
        if (!validateRequired(email)) return 'Email is required';
        if (!validateEmail(email)) return 'Invalid email format';
        return '';
    };

    const getPasswordError = () => {
        if (!touched.password || !password) return '';
        return validateRequired(password) ? '' : 'Password is required';
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            email.trim().length > 0 &&
            validateEmail(email) &&
            password.trim().length > 0
        );
    };

    const handleLogin = async () => {
        // Mark all as touched
        setTouched({ email: true, password: true });

        if (!isFormValid()) {
            shake();
            showToast('Please fix all errors', 'error');
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[
                styles.contentContainer,
                { backgroundColor: colors.background, borderColor: colors.primary, shadowColor: colors.primary },
                shakeStyle
            ]}>
                <Text style={[styles.header, { color: colors.text }]}>Welcome Back</Text>
                <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Sign in to continue your progress.</Text>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="gymbro@example.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (!touched.email) setTouched(prev => ({ ...prev, email: true }));
                        }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        error={getEmailError()}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
                        }}
                        isPassword
                        error={getPasswordError()}
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                backgroundColor: isFormValid() ? colors.primary : colors.border,
                                shadowColor: colors.primary,
                                opacity: loading ? 0.7 : 1
                            }
                        ]}
                        onPress={handleLogin}
                        disabled={loading || !isFormValid()}
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
