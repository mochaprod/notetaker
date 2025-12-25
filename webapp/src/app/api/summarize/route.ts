import { auth } from "@/lib/auth";
import { noteRepository } from "@/lib/db/db-instance";
import { Gemini } from "@/lib/llm/gemini";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({}, {
            status: 401,
        });
    }

    const notes = await noteRepository.getNotes(session.user.id);

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
