import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';
export interface RegisteredUser {
    id: number;
    cpOAuthSub: string;
    luoguUid: number;
    name: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthMeResponse {
    uid: number;
    role: number;
    registeredUser: RegisteredUser | null;
}

export async function getCurrentUser() {
    return (await apiFetch('/auth/me')) as ApiResponse<AuthMeResponse>;
}
