import { ChromaClient, Collection } from "chromadb";
import { Embedding, VectorClient } from "./client";

export class ChromaVectorDBClient implements VectorClient {
    private readonly collection: Collection;

    constructor(collection: Collection) {
        this.collection = collection;
    }

    async add(embeddings: Embedding[]): Promise<void> {
        if (embeddings) {
            await this.collection.add({
                ids: embeddings.map(({ id }) => id),
                embeddings: embeddings.map(({ embedding }) => embedding),
            });
        }
    }

    async update(embeddings: Embedding[]): Promise<void> {
        if (embeddings) {
            await this.collection.update({
                ids: embeddings.map(({ id }) => id),
                embeddings: embeddings.map(({ embedding }) => embedding),
            });
        }
    }

    async upsert(embeddings: Embedding[]): Promise<void> {
        if (embeddings) {
            await this.collection.upsert({
                ids: embeddings.map(({ id }) => id),
                embeddings: embeddings.map(({ embedding }) => embedding),
            });
        }
    }

    async delete(ids: string[]): Promise<void> {
        if (ids) {
            await this.collection.delete({
                ids,
            });
        }
    }

    async query(queryEmbeddings: number[], n?: number): Promise<string[]> {
        const results = await this.collection.query({
            queryEmbeddings: [queryEmbeddings],
            nResults: n,
        });

        return results.ids[0];
    }

    static async createClient(collectionName: string) {
        const chroma = new ChromaClient();
        const collection = await chroma.getOrCreateCollection({
            name: collectionName,
        });

        return new ChromaVectorDBClient(collection);
    }
}
