import axios from 'axios';
import { Platform } from 'react-native';
import { Config } from '../constants/Config';

const API_URL = Config?.API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export const logWorkoutSession = async (token: string, sessionData: any) => {
    try {
        const response = await axios.post(`${API_URL}/workouts`, sessionData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error logging workout:', error);
        throw error;
    }
};

export const getWorkoutHistory = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/workouts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching workout history:', error);
        throw error;
    }
};
