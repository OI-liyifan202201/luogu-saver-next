import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';

export interface QueueStatsCounts {
    waiting: number;
    active: number;
    delayed: number;
    completed: number;
    failed: number;
    paused: number;
    prioritized: number;
    waitingChildren: number;
}

export interface QueueStatsItem {
    name: string;
    taskType: string;
    label: string;
    concurrency: number;
    isPaused: boolean;
    counts: QueueStatsCounts;
}

export interface QueueStatsResponse {
    generatedAt: string;
    queuePoolSize: number;
    queues: QueueStatsItem[];
}

export async function getQueueStats() {
    return (await apiFetch('/stats/queues')) as ApiResponse<QueueStatsResponse>;
}
