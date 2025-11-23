import { EmbeddingsClient } from "./client";
import { GeminiEmbeddingsClient } from "./gemini";

export function createEmbeddingsClient(): EmbeddingsClient {
    return new GeminiEmbeddingsClient();
}
