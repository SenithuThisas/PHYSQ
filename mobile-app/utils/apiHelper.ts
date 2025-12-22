import axios, { AxiosError } from 'axios';

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as any;

        // Prefer server-provided error message if available
        if (data && data.error) {
            return data.error;
        }

        switch (status) {
            case 400:
                return 'Invalid request. Please check your inputs.';
            case 401:
                return 'Invalid email or password.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'Resource not found.';
            case 409:
                return 'This record already exists.';
            case 500:
                return 'Server error. Please try again later.';
            default:
                return 'Something went wrong. Please check your connection.';
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred.';
};

// Optional: Axios instance with interceptors can be configured here
// to automatically show toasts or handle 401 redirects globally
