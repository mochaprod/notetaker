import pino from "pino";

export const LOGGER = pino({
    level: "info",
    transport: process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        }
        : undefined,
});
