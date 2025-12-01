import pino from "pino";
import pretty from "pino-pretty";

export const LOGGER = pino({}, pretty({ colorize: true }));
