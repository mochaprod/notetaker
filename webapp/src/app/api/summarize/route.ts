import { noteRepository } from "@/lib/db/db-instance";
import { Gemini } from "@/lib/llm/gemini";

export async function GET() {
    const notes = await noteRepository.getNotes("default");

    const llm = new Gemini();
    const summary = await llm.summarize(notes);

    try {
        return Response.json(summary);
    } catch (error) {
        return Response.json({
            error,
        }, { status: 500 });
    }
}
