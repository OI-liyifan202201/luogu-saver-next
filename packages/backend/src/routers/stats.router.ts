import Router from 'koa-router';
import { Context, DefaultState } from 'koa';
import { QueueStatsService } from '@/services/queue-stats.service';

const router = new Router<DefaultState, Context>({ prefix: '/stats' });

router.get('/queues', async (ctx: Context) => {
    ctx.success(await QueueStatsService.getQueueStats());
});

export default router;
