import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';
import type { User } from '@/types/user';

export interface AuthMeResponse {
    uid: number;
    role: number;
    user: User | null;
}

export async function getCurrentUser() {
    return (await apiFetch('/auth/me')) as ApiResponse<AuthMeResponse>;
}
