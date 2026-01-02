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
}


export const deleteWorkout = async (token: string, workoutId: string) => {
    try {
        await axios.delete(`${API_URL}/workouts/${workoutId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error('Error deleting workout:', error);
        throw error;
    }
};

export const updateWorkout = async (token: string, workoutId: string, updateData: any) => {
    try {
        const response = await axios.put(`${API_URL}/workouts/${workoutId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating workout:', error);
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

export const getLastSession = async (token: string, exerciseName: string) => {
    try {
        const response = await axios.get(`${API_URL}/workouts/history`, {
            params: { exerciseName },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching last session:', error);
        return null;
    }
};

export const getWeeklyStats = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/workouts/weekly`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching weekly stats:', error);
        return { count: 0 };
    }
};
