import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';
import type { ArticleCommentsResponse } from '@/types/comment';

export async function getArticleComments(id: string) {
    return (await apiFetch(`/article/comments/${id}`)) as ApiResponse<ArticleCommentsResponse>;
}

export async function refreshArticleComments(id: string) {
    return (await apiFetch(`/article/comments/${id}/refresh`, {
        method: 'POST'
    })) as ApiResponse<{ taskId: string }>;
}
