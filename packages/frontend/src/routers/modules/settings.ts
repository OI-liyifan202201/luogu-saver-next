import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: {
            activeMenu: 'settings',
            title: '设置'
        }
    }
] as RouteRecordRaw[];
