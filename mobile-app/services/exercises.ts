import axios from 'axios';
import { Config } from '../constants/Config';
import { Platform } from 'react-native';

const API_URL = Config?.API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export interface Exercise {
    _id?: string;
    name: string;
    muscle: string;
    isCustom?: boolean;
}

export const getCustomExercises = async (token: string): Promise<Exercise[]> => {
    try {
        const response = await axios.get(`${API_URL}/exercises`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        // Mark all fetched exercises as custom
        return response.data.map((ex: any) => ({ ...ex, isCustom: true }));
    } catch (error) {
        console.error('Failed to fetch custom exercises:', error);
        throw error;
    }
};

export const createExercise = async (token: string, exerciseData: { name: string; muscle: string }): Promise<Exercise> => {
    try {
        const response = await axios.post(`${API_URL}/exercises`, exerciseData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return { ...response.data, isCustom: true };
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create exercise');
    }
};

export const updateExercise = async (token: string, id: string, exerciseData: { name: string; muscle: string }): Promise<Exercise> => {
    try {
        const response = await axios.put(`${API_URL}/exercises/${id}`, exerciseData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return { ...response.data, isCustom: true };
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update exercise');
    }
};

export const deleteExercise = async (token: string, id: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/exercises/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete exercise');
    }
};
