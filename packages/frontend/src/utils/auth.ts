import { computed } from 'vue';
import { useLocalStorage } from '@/composables/useLocalStorage.ts';
import { AUTH_TOKEN_STORAGE_KEY } from '@/utils/constants.ts';
import { getApiUrl } from '@/utils/api-base-url.ts';

const tokenStorage = useLocalStorage(AUTH_TOKEN_STORAGE_KEY, '');

export const authToken = tokenStorage;

export const isAuthenticated = computed(() => Boolean(authToken.value));

export function setAuthToken(token: string) {
    authToken.value = token;
}

export function clearAuthToken() {
    authToken.value = '';
}

export function startCpOAuthLogin(redirect: string = window.location.pathname) {
    window.location.href = getApiUrl(`/auth/cp/login?redirect=${encodeURIComponent(redirect)}`);
}
