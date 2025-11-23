import { ChromaVectorDBClient } from "./chroma";

export interface Embedding {
    id: string;
    embedding: number[];
}

export interface VectorClient {
    add(embeddings: Embedding[]): Promise<void>;
    update(embeddings: Embedding[]): Promise<void>;
    upsert(embeddings: Embedding[]): Promise<void>;
    delete(ids: string[]): Promise<void>;
    query(query: number[], n?: number): Promise<string[]>;
}

export async function createVectorDBClient(): Promise<VectorClient> {
    return ChromaVectorDBClient.createClient("notes");
}
