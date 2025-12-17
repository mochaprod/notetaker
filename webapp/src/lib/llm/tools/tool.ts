
export interface LLMTool {
    name: string;
    call: (args?: Record<string, any>) => string;
}
