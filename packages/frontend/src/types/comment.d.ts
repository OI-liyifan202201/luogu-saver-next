export interface CommentAuthor {
    id: number;
    name?: string;
    color?: string;
    ccfLevel?: number;
    xcpcLevel?: number;
}

export interface ArticleComment {
    id: string;
    content: string;
    time: number; // unix seconds
    author: CommentAuthor;
}

export interface ArticleCommentsResponse {
    comments: ArticleComment[];
    commentsStale: boolean;
    commentsFetchedAt: string | null;
}
