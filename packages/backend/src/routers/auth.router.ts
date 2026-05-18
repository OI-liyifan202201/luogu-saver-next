import Router from 'koa-router';
import { Context, DefaultState } from 'koa';
import { config } from '@/config';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { logger } from '@/lib/logger';

const router = new Router<DefaultState, Context>({ prefix: '/auth' });

function getFrontendCallbackUrl(params: Record<string, string | number | undefined>) {
    const callbackUrl = new URL(config.auth.cpOAuth.frontendRedirectUri, 'http://localhost');
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) callbackUrl.searchParams.set(key, String(value));
    }
    return `${callbackUrl.pathname}${callbackUrl.search}`;
}

router.get('/cp/login', async (ctx: Context) => {
    try {
        ctx.redirect(await AuthService.createAuthorizationUrl(ctx.query.redirect));
    } catch (error) {
        logger.error({ error }, 'Failed to create CP OAuth authorization URL');
        ctx.fail(500, error instanceof Error ? error.message : 'Failed to start CP OAuth login');
    }
});

router.get('/cp/callback', async (ctx: Context) => {
    const error = ctx.query.error as string | undefined;
    if (error) {
        ctx.redirect(
            getFrontendCallbackUrl({
                error,
                message: (ctx.query.error_description as string | undefined) || error
            })
        );
        return;
    }

    const code = ctx.query.code as string | undefined;
    const state = ctx.query.state as string | undefined;

    if (!code || !state) {
        ctx.redirect(getFrontendCallbackUrl({ error: 'invalid_request' }));
        return;
    }

    try {
        const result = await AuthService.completeCpOAuthLogin(code, state);
        ctx.redirect(
            getFrontendCallbackUrl({
                token: result.token,
                uid: result.uid,
                role: result.role,
                redirect: result.redirect
            })
        );
    } catch (callbackError) {
        logger.error({ callbackError }, 'Failed to complete CP OAuth login');
        ctx.redirect(
            getFrontendCallbackUrl({
                error: 'login_failed',
                message:
                    callbackError instanceof Error
                        ? callbackError.message
                        : 'Failed to complete CP OAuth login'
            })
        );
    }
});

router.get('/me', async (ctx: Context) => {
    if (!ctx.user || ctx.user.id === undefined) {
        ctx.fail(401, 'Unauthorized');
        return;
    }

    const user = await UserService.getUserById(ctx.user.id);
    ctx.success({ uid: ctx.user.id, role: ctx.user.role, user });
});

export default router;
