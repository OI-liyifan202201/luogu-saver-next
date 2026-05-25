import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/statistic',
        name: 'statistic',
        component: () => import('@/views/statistic/StatisticView.vue'),
        meta: {
            activeMenu: 'statistic'
        }
    }
] as RouteRecordRaw[];
