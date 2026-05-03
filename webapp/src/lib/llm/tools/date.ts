import { FunctionDeclaration, Type } from "@google/genai";
import { Day, nextDay as nextDayImpl, addDays as addDaysImpl } from "date-fns";
import { LLMTool } from "./tool";
import z from "zod/v4";

export const nextDayToolDefinition: FunctionDeclaration = {
    name: "next_day",
    description: "Get the next day from a given date. Useful for scenarios like getting the next Wednesday, Friday, etc.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            date: {
                type: Type.STRING,
                description: "Date in ISO 8601 format.",
            },
            day: {
                type: Type.STRING,
                enum: ["0", "1", "2", "3", "4", "5", "6"],
                description: "The next day. 0 - Sunday, 1 - Monday, etc.",
            },
        },
        required: ["date", "day"],
    },
};

function nextDay(today: Date, day: Day) {
    return nextDayImpl(today, day);
}

const nextDayToolArgsSchema = z.object({
    date: z.iso.datetime(),
    day: z.enum(["0", "1", "2", "3", "4", "5", "6"]),
});

export const nextDayTool: LLMTool = {
    name: "next_day",
    call: (args?: Record<string, any>) => {
        const parsedArgs = nextDayToolArgsSchema.parse(args);
        const result = nextDay(new Date(parsedArgs.date),
            Number.parseInt(parsedArgs.day) as Day);

        return result.toISOString();
    },
};

export const addDaysToolDefinition = {
    name: "add_days",
    description: "Add days to a given date.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            date: {
                type: Type.STRING,
                description: "Date in ISO 8601 format.",
            },
            offset: {
                type: Type.NUMBER,
                description: "The number of days to add. Can be negative.",
            },
        },
        required: ["date", "offset"],
    },
};

function addDays(today: Date, days: number) {
    return addDaysImpl(today, days);
}

const addDaysToolArgsSchema = z.object({
    date: z.iso.datetime(),
    offset: z.number(),
});

export const addDaysTool: LLMTool = {
    name: "add_days",
    call: (args?: Record<string, any>) => {
        const parsedArgs = addDaysToolArgsSchema.parse(args);
        const result = addDays(new Date(parsedArgs.date), parsedArgs.offset);

        return result.toISOString();
    },
};
