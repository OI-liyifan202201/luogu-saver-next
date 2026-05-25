import { Socket } from 'socket.io';
import { emitToRoom } from '@/lib/socket';
import { QueueStatsService } from '@/services/queue-stats.service';
import { logger } from '@/lib/logger';

export const QUEUE_STATS_ROOM = 'stats:queues';
export const QUEUE_STATS_EVENT = 'stats:queues:update';

export class QueueStatsBroadcaster {
    private static subscriberCount = 0;
    private static timer: NodeJS.Timeout | null = null;

    static async handleJoin(socket: Socket) {
        this.subscriberCount += 1;
        socket.once('disconnect', () => this.handleLeave());
        socket.once('leave:stats:queues', () => this.handleLeave());
        this.ensureTimer();
        socket.emit(QUEUE_STATS_EVENT, await QueueStatsService.getQueueStats());
    }

    static handleLeave() {
        this.subscriberCount = Math.max(0, this.subscriberCount - 1);
        if (this.subscriberCount === 0 && this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private static ensureTimer() {
        if (this.timer) return;

        this.timer = setInterval(async () => {
            if (this.subscriberCount <= 0) return;
            try {
                emitToRoom(
                    QUEUE_STATS_ROOM,
                    QUEUE_STATS_EVENT,
                    await QueueStatsService.getQueueStats()
                );
            } catch (error) {
                logger.error({ error }, 'Failed to broadcast queue stats');
            }
        }, 2000);
    }
}
