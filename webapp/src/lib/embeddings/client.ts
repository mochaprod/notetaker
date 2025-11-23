export interface EmbeddingsClient {
    generateEmbeddings(contents: string): Promise<number[]>;
}

export class EmbeddingsClientError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EmbeddingsClientError";
    }
}
