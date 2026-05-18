import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { BaseEntity } from './base';

@Entity({ name: 'registered_user' })
export class RegisteredUser extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'cp_oauth_sub', type: 'varchar', length: 128, unique: true })
    cpOAuthSub: string;

    @Column({ name: 'luogu_uid', type: 'int', unsigned: true, unique: true })
    luoguUid: number;

    @Column()
    name: string;

    @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
    avatarUrl: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
