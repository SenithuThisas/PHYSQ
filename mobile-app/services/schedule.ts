import axios from 'axios';
import { Platform } from 'react-native';
import { Config } from '../constants/Config'; // Assuming Config exists as seen in login.tsx

const API_URL = Config?.API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export const getSchedule = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/schedule`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        throw error;
    }
};

export const updateSchedule = async (token: string, type: 'text' | 'image', content: string) => {
    try {
        const response = await axios.put(`${API_URL}/schedule`, { type, content }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating schedule:', error);
        throw error;
    }
};
