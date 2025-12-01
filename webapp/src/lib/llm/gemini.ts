import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import mustache from "mustache";
import path from "path";
import z from "zod";
import { Note } from "../db/db";
import { LLM, SummaryResponse, SummaryResponseSchema } from "./llm";

const systemPrompt = fs.readFileSync(path.join(process.cwd(), "./src/lib/prompts/summarizer.md"), "utf8");
const notePrompt = fs.readFileSync(path.join(process.cwd(), "./src/lib/prompts/summarize-notes.md"), "utf8");

export class Gemini implements LLM {
    private genai: GoogleGenAI;

    constructor() {
        this.genai = new GoogleGenAI({});
    }

    async summarize(notes: Note[]): Promise<SummaryResponse> {
        const contents = mustache.render(notePrompt, {
            notes: notes.map((note) => JSON.stringify(note)).join("\n"),
        });

        const response = await this.genai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents,
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
