import axios from 'axios';
import { getDeviceId } from '@/utils/device-id.ts';
import { CONSENT_TRACKING_STORAGE_KEY } from '@/utils/constants.ts';
import { useLocalStorage } from '@/composables/useLocalStorage.ts';
import { API_BASE_URL } from '@/utils/api-base-url.ts';

export const apiFetch = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000
});

const trackingStorage = useLocalStorage(CONSENT_TRACKING_STORAGE_KEY, 'denied');

apiFetch.interceptors.request.use(
    config => {
        const rawToken = localStorage.getItem('auth_token');
        let token = '';
        try {
            token = rawToken ? JSON.parse(rawToken) : '';
        } catch {
            token = '';
        }
        if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
        }

        if (trackingStorage.value === 'allowed') {
            config.headers!['X-Consent-Tracking'] = 'true';
            config.headers!['X-Device-ID'] = getDeviceId();
        } else {
            config.headers!['X-Consent-Tracking'] = 'false';
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

apiFetch.interceptors.response.use(
    response => response.data,
    error => {
        return Promise.reject(error);
    }
);
