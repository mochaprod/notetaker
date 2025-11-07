import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import z from "zod";
import { LLM, SummaryResponse, SummaryResponseSchema } from "./llm";

const systemPrompt = fs.readFileSync(new URL("../prompts/summarizer.md", import.meta.url), "utf8");

export class Gemini implements LLM {
    private genai: GoogleGenAI;

    constructor() {
        this.genai = new GoogleGenAI({});
    }

    async summarize(content: string): Promise<SummaryResponse | undefined> {
        const response = await this.genai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: content,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseJsonSchema: z.toJSONSchema(SummaryResponseSchema),
            },
        });

        if (!response?.text) {
            throw new Error("No response from Gemini.");
        }

        return SummaryResponseSchema.parse(JSON.parse(response.text));
    }
}
