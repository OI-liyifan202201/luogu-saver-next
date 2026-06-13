import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/auth/callback',
        name: 'auth-callback',
        component: () => import('@/views/auth/AuthCallbackView.vue'),
        meta: {
            title: '登录验证'
        }
    }
] as RouteRecordRaw[];
