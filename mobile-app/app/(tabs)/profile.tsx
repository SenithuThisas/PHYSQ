import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Modal, FlatList } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Config } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// Helper to generate username
const generateUsername = (fullName: string) => {
    if (!fullName) return 'user' + Math.floor(Math.random() * 10000);
    const names = fullName.trim().split(' ');
    const first = names[0].toLowerCase();
    const last = names.length > 1 ? names[names.length - 1].toLowerCase() : '';
    const num = Math.floor(Math.random() * 1000);
    return `${first}${last}${num}`;
};

export default function Profile() {
    const { signOut, user, updateUser } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Prefer not to say');
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    // Height
    const [heightValue, setHeightValue] = useState('');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [heightFt, setHeightFt] = useState(''); // for ft input
    const [heightIn, setHeightIn] = useState(''); // for inches input

    // Weight
    const [weightValue, setWeightValue] = useState('');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

    const genderOptions = ['Male', 'Female', 'Prefer not to say', 'Other'];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${Config.API_URL}/user/profile`);
            const data = response.data;

            setFullName(data.fullName || '');
            setUsername(data.username || generateUsername(data.fullName));
            setEmail(data.email || '');
            setAge(data.age ? data.age.toString() : '');
            setGender(data.gender || 'Prefer not to say');
            setProfilePicture(data.profilePicture || null);

            if (data.height) {
                setHeightUnit(data.height.unit || 'cm');
                if (data.height.unit === 'ft') {
                    const val = data.height.value || 0;
                    const ft = Math.floor(val);
                    const inch = Math.round((val - ft) * 12);
                    setHeightFt(ft.toString());
                    setHeightIn(inch.toString());
                } else {
                    setHeightValue(data.height.value ? data.height.value.toString() : '');
                }
            }

            if (data.weight) {
                setWeightUnit(data.weight.unit || 'kg');
                setWeightValue(data.weight.value ? data.weight.value.toString() : '');
            }

        } catch (error) {
            console.error('Error fetching profile', error);
            if (user) {
                setFullName(user.fullName || '');
                setEmail(user.email || '');
                if (!username) setUsername(generateUsername(user.fullName || ''));
            }
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            // Ensure we use the base64 string provided
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setProfilePicture(base64Img);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let finalHeight = 0;
            if (heightUnit === 'cm') {
                finalHeight = parseFloat(heightValue);
            } else {
                finalHeight = parseFloat(heightFt || '0') + (parseFloat(heightIn || '0') / 12);
            }

            const payload = {
                fullName,
                username,
                // age is uneditable, but we send it back if it's there
                age: age ? parseInt(age) : undefined,
                gender,
                height: { value: finalHeight, unit: heightUnit },
                weight: { value: parseFloat(weightValue), unit: weightUnit },
                profilePicture
            };

            const response = await axios.put(`${Config.API_URL}/user/profile`, payload);
            if (updateUser) {
                await updateUser(response.data);
            }
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.replace('/');
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                </View>

                {/* Profile Picture */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {profilePicture ? (
                            <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{fullName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'U'}</Text>
                            </View>
                        )}
                        <View style={styles.editIconBadge}>
                            <Ionicons name="camera" size={18} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Personal Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="John Doe"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={username}
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={email}
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                placeholder="25"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Gender</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowGenderPicker(true)}
                            >
                                <Text style={styles.dropdownButtonText}>{gender}</Text>
                                <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Physical Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Physical Stats</Text>
                    <View style={styles.card}>
                        {/* Height */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Height</Text>
                                <View style={styles.unitToggleSmall}>
                                    <TouchableOpacity onPress={() => setHeightUnit('cm')} style={[styles.unitBtnSmall, heightUnit === 'cm' && styles.unitBtnSmallActive]}><Text style={[styles.unitTextSmall, heightUnit === 'cm' && styles.unitTextSmallActive]}>CM</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => setHeightUnit('ft')} style={[styles.unitBtnSmall, heightUnit === 'ft' && styles.unitBtnSmallActive]}><Text style={[styles.unitTextSmall, heightUnit === 'ft' && styles.unitTextSmallActive]}>FT</Text></TouchableOpacity>
                                </View>
                            </View>

                            {heightUnit === 'cm' ? (
                                <TextInput
                                    style={styles.input}
                                    value={heightValue}
                                    onChangeText={setHeightValue}
                                    keyboardType="numeric"
                                    placeholder="175"
                                    placeholderTextColor={Colors.textSecondary}
                                />
                            ) : (
                                <View style={styles.rowInputs}>
                                    <View style={styles.flex1}>
                                        <TextInput
                                            style={styles.input}
                                            value={heightFt}
                                            onChangeText={setHeightFt}
                                            keyboardType="numeric"
                                            placeholder="5"
                                            placeholderTextColor={Colors.textSecondary}
                                        />
                                        <Text style={styles.suffix}>ft</Text>
                                    </View>
                                    <View style={[styles.flex1, { marginLeft: 12 }]}>
                                        <TextInput
                                            style={styles.input}
                                            value={heightIn}
                                            onChangeText={setHeightIn}
                                            keyboardType="numeric"
                                            placeholder="10"
                                            placeholderTextColor={Colors.textSecondary}
                                        />
                                        <Text style={styles.suffix}>in</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Weight */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Weight</Text>
                                <View style={styles.unitToggleSmall}>
                                    <TouchableOpacity onPress={() => setWeightUnit('kg')} style={[styles.unitBtnSmall, weightUnit === 'kg' && styles.unitBtnSmallActive]}><Text style={[styles.unitTextSmall, weightUnit === 'kg' && styles.unitTextSmallActive]}>KG</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => setWeightUnit('lbs')} style={[styles.unitBtnSmall, weightUnit === 'lbs' && styles.unitBtnSmallActive]}><Text style={[styles.unitTextSmall, weightUnit === 'lbs' && styles.unitTextSmallActive]}>LBS</Text></TouchableOpacity>
                                </View>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={weightValue}
                                onChangeText={setWeightValue}
                                keyboardType="numeric"
                                placeholder={weightUnit === 'kg' ? "70" : "154"}
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Gender Modal */}
            <Modal
                visible={showGenderPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGenderPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderPicker(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Gender</Text>
                        {genderOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={styles.modalOption}
                                onPress={() => {
                                    setGender(opt);
                                    setShowGenderPicker(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, gender === opt && styles.modalOptionTextActive]}>{opt}</Text>
                                {gender === opt && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: Colors.text,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.surfaceLight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    avatarImage: {
        width: 104,
        height: 104,
        borderRadius: 52,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 16,
        color: Colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.surfaceLight,
    },
    disabledInput: {
        opacity: 0.5,
        color: Colors.textSecondary,
    },
    dropdownButton: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.surfaceLight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        color: Colors.text,
        fontSize: 16,
    },
    unitToggleSmall: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 2,
    },
    unitBtnSmall: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    unitBtnSmallActive: {
        backgroundColor: Colors.primary,
    },
    unitTextSmall: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
    unitTextSmallActive: {
        color: Colors.background,
    },
    rowInputs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flex1: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
    },
    suffix: {
        position: 'absolute',
        right: 16,
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveButtonText: {
        color: Colors.background,
        fontSize: 18,
        fontWeight: '800',
    },
    logoutButton: {
        marginTop: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceLight,
    },
    modalOptionText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    modalOptionTextActive: {
        color: Colors.primary,
        fontWeight: 'bold',
    }
});
