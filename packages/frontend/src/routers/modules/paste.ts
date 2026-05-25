import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/paste/:id',
        name: 'paste-detail',
        component: () => import('@/views/paste/PasteDetailView.vue'),
        meta: {
            activeMenu: ''
        }
    }
] as RouteRecordRaw[];
