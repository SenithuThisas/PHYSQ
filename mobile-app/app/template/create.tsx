import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { Config } from '../../constants/Config';
import { useTheme } from '../../context/ThemeContext';

export default function CreateTemplate() {
    const router = useRouter();
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [exercises, setExercises] = useState<{ name: string }[]>([]);
    const [currentExercise, setCurrentExercise] = useState('');

    const addExercise = () => {
        if (currentExercise.trim()) {
            setExercises([...exercises, { name: currentExercise.trim() }]);
            setCurrentExercise('');
        }
    };

    const saveTemplate = async () => {
        if (!name) {
            Alert.alert('Error', 'Please name your template');
            return;
        }
        if (exercises.length === 0) {
            Alert.alert('Error', 'Add at least one exercise');
            return;
        }

        try {
            await axios.post(`${Config.API_URL}/templates`, {
                name,
                exercises: exercises.map(e => ({ exerciseName: e.name }))
            });
            Alert.alert('Success', 'Template saved');
            router.back();
        } catch (err: any) {
            Alert.alert('Error', 'Failed to save template');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.header, { color: colors.text }]}>New Template</Text>

            <View style={styles.form}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Template Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderWidth: 1 }]}
                    placeholder="e.g. Pull Day"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={[styles.label, { color: colors.textSecondary }]}>Add Exercises</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderWidth: 1 }]}
                        placeholder="Exercise Name"
                        placeholderTextColor={colors.textSecondary}
                        value={currentExercise}
                        onChangeText={setCurrentExercise}
                    />
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={addExercise}>
                        <FontAwesome5 name="plus" size={16} color={colors.background} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.list}>
                    {exercises.map((ex, i) => (
                        <View key={i} style={[styles.listItem, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.listText, { color: colors.text }]}>{ex.name}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={saveTemplate}>
                <Text style={[styles.saveText, { color: colors.background }]}>Save Template</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DefaultColors.background,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DefaultColors.text,
        marginBottom: 32,
    },
    form: {
        flex: 1,
    },
    label: {
        color: DefaultColors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: DefaultColors.surface,
        color: DefaultColors.text,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: DefaultColors.primary,
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    list: {
        marginTop: 16,
    },
    listItem: {
        backgroundColor: DefaultColors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    listText: {
        color: DefaultColors.text,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: DefaultColors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveText: {
        color: DefaultColors.background,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
