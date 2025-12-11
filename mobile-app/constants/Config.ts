import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Replace with your Machine IP if running on a real device
const getApiUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:5000';
    if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
    return 'http://localhost:5000'; // iOS
};

export const Config = {
    API_URL: getApiUrl()
};
