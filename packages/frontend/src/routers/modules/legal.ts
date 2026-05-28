import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/privacy',
        name: 'privacy',
        component: () => import('@/views/legal/LegalView.vue'),
        props: { docKey: 'privacy' },
        meta: {
            activeMenu: ''
        }
    },
    {
        path: '/disclaimer',
        name: 'disclaimer',
        component: () => import('@/views/legal/LegalView.vue'),
        props: { docKey: 'disclaimer' },
        meta: {
            activeMenu: ''
        }
    },
    {
        path: '/deletion',
        name: 'deletion',
        component: () => import('@/views/legal/LegalView.vue'),
        props: { docKey: 'deletion' },
        meta: {
            activeMenu: ''
        }
    }
] as RouteRecordRaw[];
