import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

type AuthType = {
    token: string | null;
    user: any | null;
    signIn: (token: string, user: any) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (user: any) => Promise<void>;
    isLoading: boolean;
};

const AuthContext = createContext<AuthType>({
    token: null,
    user: null,
    signIn: async () => { },
    signOut: async () => { },
    updateUser: async () => { },
    isLoading: true,
});

export function useAuth() {
    return useContext(AuthContext);
}

import { Platform } from 'react-native';

const Storage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        } else {
            return await SecureStore.getItemAsync(key);
        }
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Configure global axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await Storage.getItem('userToken');
                const storedUser = await Storage.getItem('userData');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load token', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const signIn = async (newToken: string, newUser: any) => {
        setToken(newToken);
        setUser(newUser);
        await Storage.setItem('userToken', newToken);
        await Storage.setItem('userData', JSON.stringify(newUser));
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await Storage.deleteItem('userToken');
        await Storage.deleteItem('userData');
    };

    const updateUser = async (data: any) => {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        await Storage.setItem('userData', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ token, user, signIn, signOut, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
