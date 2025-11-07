import fs from "fs";
import { LLM } from "./llm";

const systemPrompt = fs.readFileSync(new URL("../prompts/summarizer.md", import.meta.url), "utf8");

export class Ollama implements LLM {
    async summarize(content: string): Promise<string | undefined> {
        try {
            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-oss", // Or any other model you have
                    system: systemPrompt,
                    prompt: content,
                    stream: false, // We want the full response at once
                    think: false,
                }),
            });

            if (!response.ok) {
                console.error("Ollama API request failed:", response.status, response.statusText);
                return undefined;
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Error calling Ollama:", error);
            return undefined;
        }
    }
}
