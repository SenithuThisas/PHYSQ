import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// PASSWORD STRENGTH CALCULATOR
// ============================================

export interface PasswordStrength {
    score: number; // 0-4
    label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
    color: string;
    suggestions: string[];
}

export const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const suggestions: string[] = [];

    if (!password) {
        return {
            score: 0,
            label: 'Very Weak',
            color: '#ef4444',
            suggestions: ['Enter a password'],
        };
    }

    // Length check
    if (password.length >= 8) score++;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score++;
    } else {
        suggestions.push('Mix uppercase and lowercase letters');
    }

    if (/\d/.test(password)) {
        score++;
    } else {
        suggestions.push('Include numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score++;
    } else {
        suggestions.push('Add special characters (!@#$%...)');
    }

    // Determine label and color based on score
    let label: PasswordStrength['label'];
    let color: string;

    if (score === 0) {
        label = 'Very Weak';
        color = '#ef4444'; // red
    } else if (score === 1) {
        label = 'Weak';
        color = '#f97316'; // orange
    } else if (score === 2 || score === 3) {
        label = 'Fair';
        color = '#eab308'; // yellow
    } else if (score === 4) {
        label = 'Good';
        color = '#84cc16'; // lime
    } else {
        label = 'Strong';
        color = '#22c55e'; // green
    }

    return { score, label, color, suggestions };
};

// ============================================
// EXISTING VALIDATION FUNCTIONS
// ============================================

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
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

// ============================================
// REAL-TIME FIELD VALIDATION HOOK
// ============================================

export interface FieldValidationResult {
    value: string;
    error: string | null;
    isValid: boolean;
    isTouched: boolean;
}

type ValidationFunction = (value: string) => { isValid: boolean; message?: string } | boolean;

export const useRealtimeFieldValidation = (
    initialValue: string = '',
    validationFn: ValidationFunction
): FieldValidationResult & {
    setValue: (value: string) => void;
    setTouched: (touched: boolean) => void;
    validate: () => boolean;
} => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);
    const [isTouched, setIsTouched] = useState(false);

    const validate = useCallback(() => {
        if (!isTouched || !value) {
            setError(null);
            return true;
        }

        const result = validationFn(value);

        if (typeof result === 'boolean') {
            const isValid = result;
            setError(isValid ? null : 'Invalid input');
            return isValid;
        } else {
            setError(result.isValid ? null : (result.message || 'Invalid input'));
            return result.isValid;
        }
    }, [value, isTouched, validationFn]);

    useEffect(() => {
        validate();
    }, [validate]);

    return {
        value,
        error,
        isValid: error === null,
        isTouched,
        setValue,
        setTouched,
        validate,
    };
};

// ============================================
// DEBOUNCED SERVER VALIDATION HOOK
// ============================================

export interface ServerValidationResult {
    loading: boolean;
    available: boolean | null;
    message: string;
}

export const useServerValidation = (
    endpoint: string,
    value: string,
    debounceMs: number = 500,
    minLength: number = 3
): ServerValidationResult => {
    const [loading, setLoading] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [message, setMessage] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (!value || value.length < minLength) {
            setAvailable(null);
            setMessage('');
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const response = await fetch(`${endpoint}?${new URLSearchParams({ [endpoint.includes('email') ? 'email' : 'username']: value })}`, {
                    signal: controller.signal,
                });

                const data = await response.json();
                setAvailable(data.available);
                setMessage(data.message);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    setAvailable(null);
                    setMessage('Unable to verify availability');
                }
            } finally {
                setLoading(false);
            }
        }, debounceMs);

        return () => {
            clearTimeout(timer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [endpoint, value, debounceMs, minLength]);

    return { loading, available, message };
};

// ============================================
// FORM VALIDATION HOOK (EXISTING)
// ============================================

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
