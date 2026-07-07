import Router from 'koa-router';
import { Context, DefaultState } from 'koa';
import { SiteNotificationService } from '@/services/site-notification.service';

const router = new Router<DefaultState, Context>({ prefix: '/notification' });

router.get('/current', async (ctx: Context) => {
    const notifications = await SiteNotificationService.getCurrentNotifications(ctx.user?.id);
    ctx.success(notifications);
});

router.post('/read', async (ctx: Context) => {
    if (!ctx.user) {
        ctx.fail(401, 'Unauthorized');
        return;
    }

    const { notificationId, updatedAt } = ctx.request.body as {
        notificationId?: unknown;
        updatedAt?: unknown;
    };
    const parsedNotificationId = Number(notificationId);
    if (!Number.isInteger(parsedNotificationId) || parsedNotificationId <= 0) {
        ctx.fail(400, 'Valid notificationId is required');
        return;
    }

    const readState = await SiteNotificationService.markNotificationRead(
        ctx.user.id,
        parsedNotificationId,
        updatedAt
    );
    ctx.success(readState);
});

export default router;
