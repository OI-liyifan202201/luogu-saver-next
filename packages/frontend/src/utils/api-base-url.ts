export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getApiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`;
}
