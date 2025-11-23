import { GoogleGenAI } from "@google/genai";
import { EmbeddingsClient, EmbeddingsClientError } from "./client";

export class GeminiEmbeddingsClient implements EmbeddingsClient {
    private readonly genai: GoogleGenAI;

    constructor() {
        this.genai = new GoogleGenAI({});
    }

    async generateEmbeddings(contents: string): Promise<number[]> {
        const response = await this.genai.models.embedContent({
            model: "gemini-embedding-001",
            contents,
        });

        if (response?.embeddings?.[0]?.values) {
            return response.embeddings[0].values;
        }

        throw new EmbeddingsClientError("No embeddings returned by Gemini.");
    }
}

