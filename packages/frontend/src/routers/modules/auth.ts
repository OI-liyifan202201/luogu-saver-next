import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/auth/callback',
        name: 'auth-callback',
        component: () => import('@/views/auth/AuthCallbackView.vue')
    }
] as RouteRecordRaw[];
