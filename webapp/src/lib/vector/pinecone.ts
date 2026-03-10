import { Pinecone } from "@pinecone-database/pinecone";
import z from "zod";
import { LOGGER } from "../logger";

export const PineconeIndexSchema = z.object({
    name: z.string(),
    host: z.string(),
});

export type PineconeIndex = z.infer<typeof PineconeIndexSchema>;

export const PineconeRecordSchema = z.object({
    id: z.string(),
    text: z.string(),
    userId: z.string(),
    updatedAt: z.coerce.date(),
});

export type PineconeRecord = z.infer<typeof PineconeRecordSchema>;

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

export class PineconeVectorDBClient {
    constructor(private readonly pinecone: Pinecone, private readonly index: PineconeIndex) {
        LOGGER.info({
            index: index.name,
            host: index.host,
        }, "Initializing Pinecone client");
    }

    async upsert(records: PineconeRecord[]) {
        const index = this.getIndex();
        LOGGER.info("Inserting to pinecone!");
        await index.upsertRecords(records.map(({
            id, text, userId, updatedAt,
        }) => {
            return {
                "_id": id,
                text,
                "user_id": userId,
                "updated_at": Math.floor(updatedAt.getTime() / 1000),
            };
        }));
    }

    async delete(ids: string[]) {
        const index = this.getIndex();
        await index.deleteMany(ids);
    }

    async query(text: string, userId: string): Promise<string[]> {
        const index = this.getIndex();
        const results = await index.searchRecords({
            query: {
                topK: 10,
                inputs: {
                    text,
                },
                filter: {
                    "user_id": userId,
                },
            },
            fields: ["text"],
        });

        return results.result.hits.map(({
            fields,
        }) => {
            const f = fields as { text: string };
            return f.text;
        });
    }

    private getIndex() {
        return this.pinecone.index(this.index.name, this.index.host);
    }
}

export const pineconeDB = new PineconeVectorDBClient(pinecone, {
    name: process.env.PINECONE_INDEX_NAME!,
    host: process.env.PINECONE_INDEX_HOST!,
});
