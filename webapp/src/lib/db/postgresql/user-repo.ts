import { PrismaClient } from "@db/prisma/generated/prisma/client";
import { UserRepository } from "../db";
import { AICredit } from "@common/types/user";

export class PostgresqlUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaClient) {
    }

    async getAICredits(userId: string): Promise<AICredit | null> {
        const aiCredits = await this.prisma.aICredit.findFirst({
            where: {
                userId,
            },
        });

        if (aiCredits) {
            return {
                credits: aiCredits.credits,
                updatedAt: aiCredits.updatedAt,
            };
        } else {
            return null;
        }
    }

    async upsertAICredits(userId: string, credits: number, refreshTimestamp?: boolean) {
        if (refreshTimestamp) {
            await this.prisma.aICredit.upsert({
                select: null,
                where: {
                    userId,
                },
                update: {
                    credits,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    credits,
                    updatedAt: new Date(),
                },
            });
        } else {
            await this.prisma.aICredit.upsert({
                select: null,
                where: {
                    userId,
                },
                update: {
                    credits,
                },
                create: {
                    userId,
                    credits,
                },
            });
        }
    }
}
