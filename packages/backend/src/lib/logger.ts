import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
    level: isDev ? 'debug' : 'info',
    serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        cleanupError: pino.stdSerializers.err,
        callbackError: pino.stdSerializers.err
    },
    transport: isDev
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  singleLine: true
              }
          }
        : undefined
});
