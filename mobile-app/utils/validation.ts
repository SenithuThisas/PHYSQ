import { useState, useCallback } from 'react';

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    // Add more complexity checks here if needed (e.g., numbers, special chars)
    return { isValid: true };
};

export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
};

export const validateNumericRange = (value: string, min: number, max: number): { isValid: boolean; message?: string } => {
    const num = parseFloat(value);
    if (isNaN(num)) {
        return { isValid: false, message: 'Must be a number' };
    }
    if (num < min || num > max) {
        return { isValid: false, message: `Value must be between ${min} and ${max}` };
    }
    return { isValid: true };
};

export const useFormValidation = <T extends Record<string, any>>(initialState: T) => {
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const setFieldError = useCallback((field: keyof T, message: string | null) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            if (message) {
                newErrors[field] = message;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        errors,
        setFieldError,
        clearErrors,
        hasErrors: Object.keys(errors).length > 0,
    };
};
