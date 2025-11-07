import { db } from "@/lib/db/db-instance";
import { Gemini } from "@/lib/llm/gemini";

export async function GET(request: Request) {
    const notes = await db.getNotes("default");
    const notesText = notes.map(note => `(${note.id}) ${note.message}`);

    const prompt = "Here are some notes taken by a user:\n\n" + notesText.join("\n\n") + "\n\nPlease provide a concise summary of these notes.";
    const llm = new Gemini();
    const summary = await llm.summarize(prompt);

    try {
        return Response.json({
            summary,
        });
    } catch (error) {
        return Response.json({
            error,
        }, { status: 500 });
    }
}
