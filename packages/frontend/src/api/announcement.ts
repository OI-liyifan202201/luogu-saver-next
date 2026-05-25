import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';

export interface Announcement {
    id: number;
    title: string;
    content: string;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export async function getCurrentAnnouncement() {
    return (await apiFetch('/announcement/current')) as ApiResponse<Announcement | null>;
}
