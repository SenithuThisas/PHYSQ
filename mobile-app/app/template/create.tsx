import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { Config } from '../../constants/Config';

export default function CreateTemplate() {
    const router = useRouter();
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
        <View style={styles.container}>
            <Text style={styles.header}>New Template</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Template Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Pull Day"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Add Exercises</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        placeholder="Exercise Name"
                        placeholderTextColor="#666"
                        value={currentExercise}
                        onChangeText={setCurrentExercise}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                        <FontAwesome5 name="plus" size={16} color={Colors.background} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.list}>
                    {exercises.map((ex, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.listText}>{ex.name}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveTemplate}>
                <Text style={styles.saveText}>Save Template</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 32,
    },
    form: {
        flex: 1,
    },
    label: {
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.text,
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
        backgroundColor: Colors.primary,
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
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    listText: {
        color: Colors.text,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveText: {
        color: Colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
