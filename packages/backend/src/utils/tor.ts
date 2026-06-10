import axios, { AxiosRequestConfig } from 'axios';
import net from 'node:net';
import { randomUUID } from 'node:crypto';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { config } from '@/config';
import { redisClient } from '@/lib/redis';
import { logger } from '@/lib/logger';

const NATIVE_429_KEY = 'luogu:tor:native429';
const NEWNYM_LOCK_KEY = 'luogu:tor:newnym:lock';

let torAgent: SocksProxyAgent | null = null;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getTorAgent() {
    if (!torAgent) {
        torAgent = new SocksProxyAgent(config.network.tor.socksProxyUrl);
    }
    return torAgent;
}

export function getTorAxiosConfig(): Pick<
    AxiosRequestConfig,
    'httpAgent' | 'httpsAgent' | 'proxy'
> {
    const agent = getTorAgent();
    return {
        httpAgent: agent,
        httpsAgent: agent,
        proxy: false
    };
}

export async function isNative429TorOnly(): Promise<boolean> {
    if (!config.network.tor.enabled) return false;

    try {
        return (await redisClient.exists(NATIVE_429_KEY)) === 1;
    } catch (error) {
        logger.warn({ error }, 'Failed to read Luogu native 429 Tor marker');
        return false;
    }
}

export async function markNative429TorOnly(): Promise<void> {
    if (!config.network.tor.enabled) return;

    try {
        await redisClient.set(
            NATIVE_429_KEY,
            '1',
            'PX',
            Math.max(1, config.network.tor.native429FallbackTtlMs)
        );
    } catch (error) {
        logger.warn({ error }, 'Failed to write Luogu native 429 Tor marker');
    }
}

function escapeControlPassword(password: string): string {
    if (/\r|\n/.test(password)) {
        throw new Error('Tor control password must not contain line breaks');
    }
    return password.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function connectControlPort(): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({
            host: config.network.tor.controlHost,
            port: config.network.tor.controlPort
        });
        const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error('Tor control connection timeout'));
        }, config.network.timeout);

        socket.once('connect', () => {
            clearTimeout(timeout);
            resolve(socket);
        });
        socket.once('error', error => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

function sendControlCommand(socket: net.Socket, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let buffer = '';
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`Tor control command timeout: ${command}`));
        }, config.network.timeout);

        const cleanup = () => {
            clearTimeout(timeout);
            socket.off('data', onData);
            socket.off('error', onError);
        };
        const onError = (error: Error) => {
            cleanup();
            reject(error);
        };
        const onData = (chunk: Buffer) => {
            buffer += chunk.toString('utf8');
            const lines = buffer.split(/\r?\n/).filter(Boolean);
            const lastLine = lines[lines.length - 1];
            if (!lastLine || !/^\d{3} /.test(lastLine)) return;

            cleanup();
            if (lastLine.startsWith('2')) {
                resolve(buffer);
            } else {
                reject(new Error(`Tor control command failed: ${lastLine}`));
            }
        };

        socket.on('data', onData);
        socket.on('error', onError);
        socket.write(`${command}\r\n`);
    });
}

async function signalNewnym(): Promise<void> {
    const socket = await connectControlPort();
    try {
        await sendControlCommand(
            socket,
            `AUTHENTICATE "${escapeControlPassword(config.network.tor.controlPassword)}"`
        );
        await sendControlCommand(socket, 'SIGNAL NEWNYM');
        await sendControlCommand(socket, 'QUIT');
    } finally {
        socket.end();
    }
}

async function logTorExitIp(): Promise<void> {
    try {
        const response = await axios.get(config.network.tor.ipCheckUrl, {
            ...getTorAxiosConfig(),
            timeout: config.network.timeout,
            validateStatus: () => true
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`IP check failed with status ${response.status}`);
        }

        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        if (!data?.ip || typeof data.ip !== 'string') {
            throw new Error('IP check response did not contain an ip string');
        }

        logger.info({ ip: data.ip }, 'Tor exit IP changed');
    } catch (error) {
        logger.warn({ error }, 'Failed to verify Tor exit IP');
    }
}

async function releaseNewnymLock(token: string): Promise<void> {
    try {
        await redisClient.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
            1,
            NEWNYM_LOCK_KEY,
            token
        );
    } catch (error) {
        logger.warn({ error }, 'Failed to release Tor NEWNYM lock');
    }
}

export async function rotateTorExitIp(): Promise<void> {
    if (!config.network.tor.enabled) return;

    const token = randomUUID();
    let acquired = false;
    try {
        const result = await redisClient.set(
            NEWNYM_LOCK_KEY,
            token,
            'PX',
            Math.max(1, config.network.tor.newnymLockTtlMs),
            'NX'
        );
        acquired = result === 'OK';
    } catch (error) {
        logger.warn({ error }, 'Failed to acquire Tor NEWNYM lock');
    }

    if (!acquired) {
        await sleep(config.network.tor.newnymCooldownMs);
        return;
    }

    try {
        await signalNewnym();
        await sleep(config.network.tor.newnymCooldownMs);
        await logTorExitIp();
    } finally {
        await releaseNewnymLock(token);
    }
}
