import { EmbeddingsClient } from "./client";

export class OllamaEmbeddingsClient implements EmbeddingsClient {
    async generateEmbeddings(contents: string): Promise<number[]> {
        return [];
    }
}
