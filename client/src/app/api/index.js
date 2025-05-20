import { BASE_URL } from '@/utils/const';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const user = localStorage.getItem('user');
        if (user) {
            config.headers['user-id'] = JSON.parse(user).id;
        }
    }

    return config;
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response?.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized. Redirecting to login...');
            router.push('/login');
        }
        const response = error.response?.data?.errors;
        if (Array.isArray(response)) {
            return {
                errors: response
            }
        }
        return {
            errors: ['Something went wrong']
        }
    }
);

export default axiosInstance;
