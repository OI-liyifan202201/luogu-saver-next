import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Type } from 'class-transformer';
import { BaseEntity } from './base';

@Entity({ name: 'announcement' })
export class Announcement extends BaseEntity {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'mediumtext' })
    content: string;

    @Column({ type: 'tinyint', default: 1 })
    enabled: boolean;

    @CreateDateColumn({ name: 'created_at' })
    @Type(() => Date)
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    @Type(() => Date)
    updatedAt: Date;
}
