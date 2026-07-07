import { logger } from '@/lib/logger';
import { Socket } from 'socket.io';
import { emitToRoom } from '@/lib/socket';
import { TaskService } from '@/services/task.service';
import { TaskStatus } from '@/shared/task';
import { normalizeErrorReason } from '@/utils/error-reason';

export async function handleTaskRoomJoin(socket: Socket, taskId: string) {
    try {
        const task = await TaskService.getTaskById(taskId);
        if (task && task.status === TaskStatus.COMPLETED) {
            emitToRoom(`task:${taskId}`, `task:${taskId}:completed`, { status: 'completed' });
            logger.info(
                { socketId: socket.id, taskId },
                'Sent immediate task result to reconnected client'
            );
        } else if (task && task.status === TaskStatus.FAILED) {
            emitToRoom(`task:${taskId}`, `task:${taskId}:failed`, {
                status: 'failed',
                error: normalizeErrorReason(task.info)
            });
            logger.info(
                { socketId: socket.id, taskId },
                'Sent immediate task failure to reconnected client'
            );
        }
    } catch (error) {
        logger.error({ error, taskId }, 'Failed to check task status on join');
    }
}
