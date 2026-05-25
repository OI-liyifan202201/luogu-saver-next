import { Server, Socket } from 'socket.io';
import http from 'http';
import { logger } from './logger';

let io: Server | null = null;

export function initSocket(
    server: http.Server,
    joinRoomCallback?: (socket: Socket, room: string) => Promise<void>
): Server {
    io = new Server(server, {
        path: '/websocket',
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', async (socket: Socket) => {
        logger.info({ id: socket.id }, 'Client connected');

        socket.on('join', async (room: string) => {
            socket.join(room);
            logger.info({ id: socket.id, room }, 'Client joined room');
            if (joinRoomCallback) {
                try {
                    await joinRoomCallback(socket, room);
                } catch {
                    logger.info({ id: socket.id, room }, 'Error in joinRoomCallback');
                }
            }
        });

        socket.on('leave', (room: string) => {
            socket.leave(room);
            socket.emit(`leave:${room}`);
            logger.info({ id: socket.id, room }, 'Client left room');
        });

        socket.on('disconnect', () => {
            logger.info({ id: socket.id }, 'Client disconnected');
        });
    });

    return io;
}

export function emitToRoom(room: string, event: string, data: any = {}) {
    if (!io) {
        logger.warn('Socket.io not initialized, skipping emit');
        return;
    }
    logger.debug({ room, event, data }, 'Emitting event to room');
    io.to(room).emit(event, data);
}

export function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}
