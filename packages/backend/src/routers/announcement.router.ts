import Router from 'koa-router';
import { Context, DefaultState } from 'koa';
import { AnnouncementService } from '@/services/announcement.service';

const router = new Router<DefaultState, Context>({ prefix: '/announcement' });

router.get('/current', async (ctx: Context) => {
    const announcement = await AnnouncementService.getPublicAnnouncement();
    ctx.success(announcement);
});

export default router;
