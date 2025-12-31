import { PrismaClient } from "@db/prisma/generated/prisma/client";
import { DigestRepository } from "../db";
import { Summary, SummarySchema } from "@common/types/summary";

export class PostgresqlDigestRepository implements DigestRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async putSummary(
        userId: string,
        startDateKey: string,
        endDateKey: string,
        summary: Omit<Summary, "id" | "startDate" | "endDate">
    ) {
        const {
            tasks,
            summary: summaryText,
            themes,
            followUps,
            corrections,
        } = summary;

        const summaryData = await this.prisma.digest.create({
            data: {
                startDate: startDateKey,
                endDate: endDateKey,
                userId,
                summary: summaryText,
                items: {
                    create: tasks.map(
                        ({ content, theme, datetime, important, noteIds }) => ({
                            content,
                            category: theme,
                            datetime,
                            important,
                            notes: {
                                connect: noteIds.map((noteId) => ({
                                    id: noteId,
                                })),
                            },
                        })
                    ),
                },
                themes: {
                    createMany: {
                        data: themes.map(({ name, description }) => ({
                            name,
                            description,
                        })),
                    },
                },
                corrections: {
                    createMany: {
                        data: corrections.map(
                            ({ noteId, explanation, confidence }) => ({
                                noteId,
                                explanation,
                                confidence,
                            })
                        ),
                    },
                },
                followUpQuestions: {
                    createMany: {
                        data: followUps.map((question) => ({
                            question,
                        })),
                    },
                },
            },
        });

        const response: Summary = {
            id: summaryData.id,
            startDate: summaryData.startDate,
            endDate: summaryData.endDate,
            summary: summaryData.summary,
            tasks,
            themes,
            followUps,
            corrections,
        };

        return response;
    }

    async getSummary(userId: string, startDateKey: string, endDateKey: string) {
        const response = await this.prisma.digest.findFirst({
            where: {
                userId,
                startDate: startDateKey,
                endDate: endDateKey,
            },
            include: {
                items: {
                    include: {
                        notes: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                themes: {
                    include: {
                        notes: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                followUpQuestions: true,
                corrections: true,
            },
        });

        if (!response) {
            return null;
        }

        const result = {
            id: response.id,
            startDate: response.startDate,
            endDate: response.endDate,
            summary: response.summary,
            tasks: response.items.map((item) => ({
                id: item.id,
                content: item.content,
                theme: item.category,
                datetime: item.datetime,
                important: item.important,
                noteIds: item.notes.map((note) => note.id),
            })),
            themes: response.themes.map((theme) => ({
                id: theme.id,
                name: theme.name,
                description: theme.description,
                noteIds: theme.notes.map((note) => note.id),
            })),
            followUps: response.followUpQuestions.map(
                (followUp) => followUp.question
            ),
            corrections: response.corrections.map(
                ({ explanation, confidence, noteId }) => ({
                    noteId,
                    explanation,
                    confidence,
                })
            ),
        };

        return SummarySchema.parse(result);
    }
}
