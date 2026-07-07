import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';

export type NotificationChannel = 'banner' | 'popup';

export interface SiteNotificationItem {
    id: number;
    channel: NotificationChannel;
    title: string;
    content: string;
    loginOnly: boolean;
    sortOrder: number;
    updatedAt: string;
    read: boolean;
}

export interface CurrentNotificationsResponse {
    banners: SiteNotificationItem[];
    popups: SiteNotificationItem[];
}

export async function getCurrentNotifications() {
    return (await apiFetch('/notification/current')) as ApiResponse<CurrentNotificationsResponse>;
}

export async function markNotificationRead(notificationId: number, updatedAt: string) {
    return (await apiFetch('/notification/read', {
        method: 'POST',
        data: { notificationId, updatedAt }
    })) as ApiResponse<{ notificationId: number; updatedAt: string; read: true }>;
}
