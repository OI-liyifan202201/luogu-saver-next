import { z } from 'zod';

const CpOAuthSchema = z.object({
    discoveryUrl: z.string().default('https://www.cpoauth.com/.well-known/openid-configuration'),
    clientId: z.string().default(''),
    clientSecret: z.string().default(''),
    redirectUri: z.string().default(''),
    frontendRedirectUri: z.string().default('/auth/callback'),
    scopes: z.array(z.string()).default(['openid', 'profile', 'link:luogu']),
    stateExpireSeconds: z.number().default(600)
});

export const AuthSchema = z.object({
    cpOAuth: z.preprocess(value => value ?? {}, CpOAuthSchema)
});
