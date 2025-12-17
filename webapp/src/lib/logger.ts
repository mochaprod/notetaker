import pino from "pino";
import pretty from "pino-pretty";

export const LOGGER = pino({
    level: "debug",
}, pretty({ colorize: true }));
