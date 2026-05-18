import { RegisteredUser } from '@/entities/registered-user';

type CpOAuthRegisteredUserData = {
    cpOAuthSub: string;
    luoguUid: number;
    name?: string;
    avatarUrl?: string;
};

export class RegisteredUserService {
    static async upsertCpOAuthUser(data: CpOAuthRegisteredUserData): Promise<RegisteredUser> {
        if (!data.cpOAuthSub) throw new Error('CP OAuth sub is required');
        if (!Number.isInteger(data.luoguUid) || data.luoguUid <= 0) {
            throw new Error('Positive Luogu user ID is required');
        }

        const repository = RegisteredUser.getRepository();
        const registeredUser = repository.create({
            cpOAuthSub: data.cpOAuthSub,
            luoguUid: data.luoguUid,
            name: data.name || `User ${data.luoguUid}`,
            avatarUrl: data.avatarUrl || null
        });

        await repository.upsert(registeredUser, ['cpOAuthSub']);

        const saved = await repository.findOneByOrFail({ cpOAuthSub: data.cpOAuthSub });
        return saved;
    }

    static async getById(id: number): Promise<RegisteredUser | null> {
        return RegisteredUser.findOne({ where: { id } });
    }
}
