import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/about',
        name: 'about',
        component: () => import('@/views/about/AboutView.vue'),
        meta: {
            activeMenu: 'about'
        }
    }
] as RouteRecordRaw[];
