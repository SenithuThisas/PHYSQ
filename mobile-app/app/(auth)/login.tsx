import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
    const { colors } = useTheme();

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.contentContainer, { backgroundColor: colors.background, borderColor: colors.primary, shadowColor: colors.primary }]}>
                <Text style={[styles.header, { color: colors.text }]}>Welcome Back</Text>
                <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Sign in to continue your progress.</Text>

                <View style={styles.form}>
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

                    <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                    <View style={[styles.passwordContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.passwordInput, { color: colors.text }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleLogin} disabled={loading}>
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

                    <TouchableOpacity style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => Alert.alert('Coming Soon', 'Google Auth requires GCP setup!')}>
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
        marginBottom: 48,
        textAlign: 'center',
    },
    form: {
        gap: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DefaultColors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: DefaultColors.border,
        paddingRight: 16,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        color: DefaultColors.text,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
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
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: DefaultColors.border,
    },
    button: {
        backgroundColor: DefaultColors.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
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

