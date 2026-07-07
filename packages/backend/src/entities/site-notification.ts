import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { BaseEntity } from './base';

export type SiteNotificationChannel = 'banner' | 'popup';

@Entity({ name: 'site_notification' })
export class SiteNotification extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 16 })
    channel: SiteNotificationChannel;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'mediumtext', nullable: true })
    content: string | null;

    @Column({ type: 'tinyint', default: 1 })
    enabled: boolean;

    @Column({ name: 'login_only', type: 'tinyint', default: 0 })
    loginOnly: boolean;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
