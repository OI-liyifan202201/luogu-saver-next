import {
    IconUser,
    IconLightbulb,
    IconWrench,
    IconCpu,
    IconCamera,
    IconGraduationCap,
    IconGamepad2,
    IconMessagesSquare,
    IconCircleHelp
} from '@/utils/icons';

export const ARTICLE_CATEGORIES: Record<number, { label: string; icon: any; color: string }> = {
    1: { label: '个人记录', icon: IconUser, color: 'var(--ui-category-personal-color)' },
    2: { label: '题解', icon: IconLightbulb, color: 'var(--ui-category-solution-color)' },
    3: { label: '科技·工程', icon: IconWrench, color: 'var(--ui-category-tech-color)' },
    4: {
        label: '算法·理论',
        icon: IconCpu,
        color: 'var(--ui-category-algorithm-color)'
    },
    5: { label: '生活·游记', icon: IconCamera, color: 'var(--ui-category-life-color)' },
    6: { label: '学习·文化课', icon: IconGraduationCap, color: 'var(--ui-category-study-color)' },
    7: { label: '休闲·娱乐', icon: IconGamepad2, color: 'var(--ui-category-fun-color)' },
    8: { label: '闲话', icon: IconMessagesSquare, color: 'var(--ui-category-chat-color)' },
    9: { label: '未知', icon: IconCircleHelp, color: 'var(--ui-category-unknown-color)' }
};

export const UNKNOWN_CATEGORY = {
    label: '未知分类',
    icon: IconCircleHelp,
    color: 'var(--ui-category-unknown-color)'
};

export const THEME_STORAGE_KEY = 'ui_theme';
export const THEME_MODE_STORAGE_KEY = 'ui_theme_mode';
export const CACHE_STORAGE_KEY = 'save_cache_';
export const DEVICE_ID_STORAGE_KEY = 'anon_device_id';
export const CONSENT_TRACKING_STORAGE_KEY = 'consent_tracking';
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';
export const RAG_KNOWLEDGE_BASE_STORAGE_KEY = 'rag_knowledge_base_articles';
export const LUOGU_SOURCE_STORAGE_KEY = 'luogu_source_host';
export const NOTIFICATION_READ_STORAGE_KEY = 'site_notification_read_state';
