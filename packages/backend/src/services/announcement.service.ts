import { Announcement } from '@/entities/announcement';
import { findOneServiceEntity, saveServiceEntity } from '@/services/helpers/repository.helper';

export type AnnouncementInput = {
    title?: unknown;
    content?: unknown;
    enabled?: unknown;
};

const ANNOUNCEMENT_ID = 1;
const DEFAULT_TITLE = '公告';

export class AnnouncementService {
    static async getPublicAnnouncement(): Promise<Announcement | null> {
        const announcement = await this.getStoredAnnouncement();
        if (!announcement?.enabled) return null;
        return announcement;
    }

    static async getAdminAnnouncement(): Promise<Partial<Announcement>> {
        const announcement = await this.getStoredAnnouncement();
        if (announcement) return announcement;

        return {
            id: ANNOUNCEMENT_ID,
            title: DEFAULT_TITLE,
            content: '',
            enabled: true
        };
    }

    static async updateAnnouncement(input: AnnouncementInput): Promise<Announcement> {
        const existing = await this.getStoredAnnouncement();
        const announcement =
            existing ||
            Announcement.create({
                id: ANNOUNCEMENT_ID
            });

        announcement.title = this.normalizeTitle(input.title);
        announcement.content = String(input.content ?? '');
        announcement.enabled = Boolean(input.enabled);

        await saveServiceEntity<Announcement>(Announcement, announcement);
        return announcement;
    }

    private static async getStoredAnnouncement(): Promise<Announcement | null> {
        return await findOneServiceEntity<Announcement>(Announcement, {
            where: { id: ANNOUNCEMENT_ID }
        });
    }

    private static normalizeTitle(value: unknown): string {
        const title = String(value ?? '').trim();
        return title || DEFAULT_TITLE;
    }
}
