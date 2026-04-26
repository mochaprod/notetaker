import pino from "pino";

export const BROWSER_LOGGER = pino({
    level: "debug",
    browser: {
        asObject: true,
    },
});
