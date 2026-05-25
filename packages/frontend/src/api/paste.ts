import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';
import type { Paste } from '@/types/paste';
import { createWorkflowFromTemplate } from '@/api/workflow.ts';

export async function getPasteById(id: string) {
    return (await apiFetch(`/paste/query/${id}`)) as ApiResponse<Paste>;
}

export async function getPasteCount() {
    return (await apiFetch('/paste/count')) as ApiResponse<{ count: number }>;
}

export async function savePaste(id: string) {
    return await createWorkflowFromTemplate('paste-save-pipeline', {
        targetId: id
    });
}
