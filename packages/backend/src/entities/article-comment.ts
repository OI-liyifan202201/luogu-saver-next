import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from './base';
import { User } from './user';

@Entity({ name: 'article_comment' })
@Index('idx_article_comment_article', ['articleId'])
export class ArticleComment extends BaseEntity {
    // Luogu comment id (globally unique across the site)
    @PrimaryColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ name: 'article_id', type: 'varchar', length: 8 })
    articleId: string;

    @Column({ name: 'author_id', unsigned: true })
    authorId: number;

    @Column({ type: 'mediumtext' })
    content: string;

    // Original Luogu timestamp, unix seconds.
    @Column({ name: 'comment_time', type: 'bigint' })
    time: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    author?: User;
}
