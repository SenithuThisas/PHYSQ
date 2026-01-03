import axios from 'axios';
import { Platform } from 'react-native';
import { Config } from '../constants/Config';

const API_URL = Config?.API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export interface Schedule {
    _id: string;
    title: string;
    type: 'text' | 'image';
    content: string;
    createdAt?: string;
}

export const getSchedules = async (token: string): Promise<Schedule[]> => {
    try {
        const response = await axios.get(`${API_URL}/schedule`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching schedules:', error);
        throw error;
    }
};

export const createSchedule = async (token: string, data: { title: string; type: 'text' | 'image'; content: string }) => {
    try {
        const response = await axios.post(`${API_URL}/schedule`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating schedule:', error);
        throw error;
    }
};

export const updateSchedule = async (token: string, id: string, data: { title: string; type: 'text' | 'image'; content: string }) => {
    try {
        const response = await axios.put(`${API_URL}/schedule/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating schedule:', error);
        throw error;
    }
};

export const deleteSchedule = async (token: string, id: string) => {
    try {
        await axios.delete(`${API_URL}/schedule/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        throw error;
    }
};
