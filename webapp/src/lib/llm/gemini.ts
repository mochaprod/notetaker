import { Note } from "@common/types/notes";
import { Content, GoogleGenAI } from "@google/genai";
import fs from "fs";
import mustache from "mustache";
import path from "path";
import z from "zod";
import { LOGGER } from "../logger";
import { LLM, LLMSummary, LLMSummarySchema } from "./llm";
import { addDaysTool, addDaysToolDefinition, nextDayTool, nextDayToolDefinition } from "./tools/date";
import { LLMTool } from "./tools/tool";

const systemPrompt = fs.readFileSync(path.join(process.cwd(), "./src/lib/prompts/summarizer.md"), "utf8");
const systemPromptJson = fs.readFileSync(path.join(process.cwd(), "./src/lib/prompts/summarizer-json.md"), "utf8");
const notePrompt = fs.readFileSync(path.join(process.cwd(), "./src/lib/prompts/summarize-notes.md"), "utf8");

const LLM_TOOLS: LLMTool[] = [nextDayTool, addDaysTool];

export class Gemini implements LLM {
    private genai: GoogleGenAI;

    constructor() {
        this.genai = new GoogleGenAI({});
    }

    async summarize(notes: Note[]): Promise<LLMSummary> {
        const textSummary = await this.createTextSummary(notes);
        LOGGER.debug(textSummary);

        return this.createJSONSummary(textSummary);
    }

    private async createJSONSummary(textSummary: string): Promise<LLMSummary> {
        const jsonSummaryPrompt = mustache.render(systemPromptJson, {
            document: textSummary,
        });

        const response = await this.genai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: jsonSummaryPrompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: z.toJSONSchema(LLMSummarySchema),
            },
        });

        if (!response.text) {
            LOGGER.error(response);
            throw new Error("Failed to get JSON summary.");
        }

        LOGGER.debug(response.text);

        return LLMSummarySchema.parse(JSON.parse(response.text));
    }

    private async createTextSummary(notes: Note[]): Promise<string> {
        const summaryPrompt = mustache.render(notePrompt, {
            notes: notes.map((note) => JSON.stringify(note)).join("\n"),
        });

        LOGGER.debug(summaryPrompt);

        const contents: Content[] = [
            {
                role: "user",
                parts: [
                    {
                        text: summaryPrompt,
                    },
                ],
            },
        ];

        const MAX_FUNCTION_CALL_LOOPS = 5;
        let loop = 0;

        while (loop < MAX_FUNCTION_CALL_LOOPS) {
            loop++;

            const response = await this.genai.models.generateContent({
                model: "gemini-2.5-flash",
                contents,
                config: {
                    systemInstruction: systemPrompt,
                    tools: [{
                        functionDeclarations: [nextDayToolDefinition, addDaysToolDefinition],
                    }],
                },
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                for (let i = 0; i < response.functionCalls.length; i++) {
                    const fnCall = response.functionCalls[i];
                    const { name, args } = fnCall;

                    const tool = LLM_TOOLS.find((tool) => tool.name === name);

                    if (tool) {
                        const functionCallResult = tool.call(args);

                        contents.push({
                            role: "model",
                            parts: [
                                {
                                    functionCall: fnCall,
                                },
                            ],
                        });
                        contents.push({
                            role: "user",
                            parts: [
                                {
                                    functionResponse: {
                                        name,
                                        response: {
                                            result: functionCallResult,
                                        },
                                    },
                                },
                            ],
                        });
                    }
                }
            } else if (response.text) {
                return response.text;
            } else {
                LOGGER.error(response);
                throw new Error("LLM error");
            }
        }

        throw new Error("Max LLM calls reached for this summary.");
    }
}
