import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base';

@Entity({ name: 'notification_read_state' })
export class NotificationReadState extends BaseEntity {
    @PrimaryColumn({ name: 'registered_user_id', type: 'int', unsigned: true })
    registeredUserId: number;

    @PrimaryColumn({ name: 'notification_id', type: 'int', unsigned: true })
    notificationId: number;

    @Column({ name: 'notification_updated_at', type: 'datetime' })
    notificationUpdatedAt: Date;

    @UpdateDateColumn({ name: 'read_at' })
    readAt: Date;
}
